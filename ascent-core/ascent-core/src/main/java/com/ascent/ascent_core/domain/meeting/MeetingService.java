package com.ascent.ascent_core.domain.meeting;

import com.ascent.ascent_core.domain.kanban.KanbanCard;
import com.ascent.ascent_core.domain.kanban.KanbanCardRepository;
import com.ascent.ascent_core.domain.kanban.KanbanPriority;
import com.ascent.ascent_core.domain.kanban.KanbanStatus;
import com.ascent.ascent_core.domain.meeting.dto.MeetingCreateRequest;
import com.ascent.ascent_core.domain.meeting.dto.MeetingResponse;
import com.ascent.ascent_core.domain.meeting.dto.MeetingSummaryResponse;
import com.ascent.ascent_core.domain.project.Project;
import com.ascent.ascent_core.domain.project.ProjectMemberRepository;
import com.ascent.ascent_core.domain.project.ProjectRepository;
import com.ascent.ascent_core.domain.user.User;
import com.ascent.ascent_core.domain.user.UserRepository;
import com.ascent.ascent_core.global.exception.CustomException;
import com.ascent.ascent_core.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MeetingService {

    private final MeetingRepository meetingRepository;
    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final UserRepository userRepository;
    private final KanbanCardRepository kanbanCardRepository;

    public List<MeetingSummaryResponse> getMeetings(Long projectId) {
        return meetingRepository.findAllByProjectIdOrderByMeetingDateDesc(projectId)
                .stream().map(MeetingSummaryResponse::new).collect(Collectors.toList());
    }

    public MeetingResponse getMeeting(Long meetingId) {
        Meeting meeting = meetingRepository.findByIdWithDetails(meetingId)
                .orElseThrow(() -> new CustomException(ErrorCode.PROJECT_NOT_FOUND));
        return new MeetingResponse(meeting);
    }

    @Transactional
    public MeetingResponse createMeeting(Long projectId, Long userId, MeetingCreateRequest request) {
        checkMember(projectId, userId);

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new CustomException(ErrorCode.PROJECT_NOT_FOUND));
        User author = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        Meeting meeting = Meeting.create(project, author, request.getTitle(),
                request.getMeetingDate(), request.getContent(), request.getNextMeetingDate());

        // 참석자 추가
        if (request.getAttendeeIds() != null) {
            request.getAttendeeIds().forEach(attendeeId -> {
                User attendee = userRepository.findById(attendeeId).orElse(null);
                if (attendee != null) meeting.getAttendees().add(MeetingAttendee.of(meeting, attendee));
            });
        }

        // 액션 아이템 추가
        if (request.getActionItems() != null) {
            request.getActionItems().forEach(item -> {
                User assignee = item.getAssigneeId() != null ? userRepository.findById(item.getAssigneeId()).orElse(null) : null;
                meeting.getActionItems().add(MeetingActionItem.create(meeting, assignee, item.getTitle(), item.getDueDate()));
            });
        }

        // 결정 사항 추가
        if (request.getDecisions() != null) {
            request.getDecisions().stream().filter(d -> d != null && !d.isBlank())
                    .forEach(d -> meeting.getDecisions().add(MeetingDecision.of(meeting, d)));
        }

        meetingRepository.save(meeting);
        return new MeetingResponse(meeting);
    }

    @Transactional
    public MeetingResponse linkActionItemToKanban(Long projectId, Long meetingId, Long actionItemId, Long userId) {
        checkMember(projectId, userId);

        Meeting meeting = meetingRepository.findByIdWithDetails(meetingId)
                .orElseThrow(() -> new CustomException(ErrorCode.PROJECT_NOT_FOUND));

        MeetingActionItem actionItem = meeting.getActionItems().stream()
                .filter(item -> item.getId().equals(actionItemId))
                .findFirst()
                .orElseThrow(() -> new CustomException(ErrorCode.PROJECT_NOT_FOUND));

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new CustomException(ErrorCode.PROJECT_NOT_FOUND));

        int position = kanbanCardRepository.countByProjectIdAndStatus(projectId, KanbanStatus.TODO);
        KanbanCard card = KanbanCard.create(project, actionItem.getAssignee(),
                actionItem.getTitle(), null, KanbanPriority.MEDIUM, actionItem.getDueDate(), position);
        kanbanCardRepository.save(card);

        actionItem.markLinkedToKanban();
        return new MeetingResponse(meeting);
    }

    @Transactional
    public void deleteMeeting(Long projectId, Long meetingId, Long userId) {
        checkMember(projectId, userId);
        meetingRepository.deleteById(meetingId);
    }

    private void checkMember(Long projectId, Long userId) {
        projectMemberRepository.findByProjectIdAndUserId(projectId, userId)
                .orElseThrow(() -> new CustomException(ErrorCode.FORBIDDEN));
    }
}
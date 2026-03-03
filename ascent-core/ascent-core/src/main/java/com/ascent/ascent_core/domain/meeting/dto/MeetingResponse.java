package com.ascent.ascent_core.domain.meeting.dto;

import com.ascent.ascent_core.domain.meeting.Meeting;
import com.ascent.ascent_core.domain.meeting.MeetingActionItem;
import com.ascent.ascent_core.domain.meeting.MeetingDecision;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Getter
public class MeetingResponse {

    private final Long id;
    private final String title;
    private final LocalDate meetingDate;
    private final String content;
    private final LocalDate nextMeetingDate;
    private final Long authorId;
    private final String authorNickname;
    private final List<AttendeeResponse> attendees;
    private final List<ActionItemResponse> actionItems;
    private final List<DecisionResponse> decisions;
    private final LocalDateTime createdAt;

    public MeetingResponse(Meeting m) {
        this.id = m.getId();
        this.title = m.getTitle();
        this.meetingDate = m.getMeetingDate();
        this.content = m.getContent();
        this.nextMeetingDate = m.getNextMeetingDate();
        this.authorId = m.getAuthor().getId();
        this.authorNickname = m.getAuthor().getNickname();
        this.attendees = m.getAttendees().stream().map(a -> new AttendeeResponse(a.getUser().getId(), a.getUser().getNickname())).collect(Collectors.toList());
        this.actionItems = m.getActionItems().stream().map(ActionItemResponse::new).collect(Collectors.toList());
        this.decisions = m.getDecisions().stream().map(DecisionResponse::new).collect(Collectors.toList());
        this.createdAt = m.getCreatedAt();
    }

    @Getter
    public static class AttendeeResponse {
        private final Long userId;
        private final String nickname;
        public AttendeeResponse(Long userId, String nickname) {
            this.userId = userId;
            this.nickname = nickname;
        }
    }

    @Getter
    public static class ActionItemResponse {
        private final Long id;
        private final String title;
        private final Long assigneeId;
        private final String assigneeNickname;
        private final LocalDate dueDate;
        private final boolean linkedToKanban;
        public ActionItemResponse(MeetingActionItem item) {
            this.id = item.getId();
            this.title = item.getTitle();
            this.assigneeId = item.getAssignee() != null ? item.getAssignee().getId() : null;
            this.assigneeNickname = item.getAssignee() != null ? item.getAssignee().getNickname() : null;
            this.dueDate = item.getDueDate();
            this.linkedToKanban = item.isLinkedToKanban();
        }
    }

    @Getter
    public static class DecisionResponse {
        private final Long id;
        private final String content;
        public DecisionResponse(MeetingDecision d) {
            this.id = d.getId();
            this.content = d.getContent();
        }
    }
}
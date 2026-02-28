package com.ascent.ascent_core.domain.schedule;

import com.ascent.ascent_core.domain.project.Project;
import com.ascent.ascent_core.domain.project.ProjectMemberRepository;
import com.ascent.ascent_core.domain.project.ProjectRepository;
import com.ascent.ascent_core.domain.schedule.dto.ScheduleCreateRequest;
import com.ascent.ascent_core.domain.schedule.dto.ScheduleResponse;
import com.ascent.ascent_core.domain.schedule.dto.ScheduleUpdateRequest;
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
public class ScheduleService {

    private final ScheduleRepository scheduleRepository;
    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final UserRepository userRepository;

    // 일정 목록 조회
    public List<ScheduleResponse> getSchedules(Long projectId) {
        return scheduleRepository.findAllByProjectIdOrderByStartDateAsc(projectId)
                .stream()
                .map(ScheduleResponse::new)
                .collect(Collectors.toList());
    }

    // 일정 생성
    @Transactional
    public ScheduleResponse createSchedule(Long projectId, Long userId, ScheduleCreateRequest request) {
        checkMember(projectId, userId);

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new CustomException(ErrorCode.PROJECT_NOT_FOUND));

        User assignee = null;
        if (request.getAssigneeId() != null) {
            assignee = userRepository.findById(request.getAssigneeId())
                    .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
        }

        Schedule schedule = Schedule.create(
                project, assignee,
                request.getTitle(), request.getDescription(),
                request.getStartDate(), request.getEndDate()
        );

        scheduleRepository.save(schedule);
        return new ScheduleResponse(schedule);
    }

    // 일정 수정
    @Transactional
    public ScheduleResponse updateSchedule(Long projectId, Long scheduleId, Long userId, ScheduleUpdateRequest request) {
        checkMember(projectId, userId);

        Schedule schedule = scheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new CustomException(ErrorCode.PROJECT_NOT_FOUND));

        User assignee = null;
        if (request.getAssigneeId() != null) {
            assignee = userRepository.findById(request.getAssigneeId())
                    .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
        }

        schedule.update(request.getTitle(), request.getDescription(),
                request.getStartDate(), request.getEndDate(), assignee);

        return new ScheduleResponse(schedule);
    }

    // 완료 토글
    @Transactional
    public ScheduleResponse toggleComplete(Long projectId, Long scheduleId, Long userId) {
        checkMember(projectId, userId);

        Schedule schedule = scheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new CustomException(ErrorCode.PROJECT_NOT_FOUND));

        schedule.toggleComplete();
        return new ScheduleResponse(schedule);
    }

    // 일정 삭제
    @Transactional
    public void deleteSchedule(Long projectId, Long scheduleId, Long userId) {
        checkMember(projectId, userId);
        scheduleRepository.deleteById(scheduleId);
    }

    private void checkMember(Long projectId, Long userId) {
        projectMemberRepository.findByProjectIdAndUserId(projectId, userId)
                .orElseThrow(() -> new CustomException(ErrorCode.FORBIDDEN));
    }
}
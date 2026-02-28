package com.ascent.ascent_core.domain.schedule.dto;

import com.ascent.ascent_core.domain.schedule.Schedule;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
public class ScheduleResponse {

    private final Long id;
    private final Long projectId;
    private final String title;
    private final String description;
    private final LocalDate startDate;
    private final LocalDate endDate;
    private final boolean completed;
    private final Long assigneeId;
    private final String assigneeNickname;
    private final LocalDateTime createdAt;

    public ScheduleResponse(Schedule s) {
        this.id = s.getId();
        this.projectId = s.getProject().getId();
        this.title = s.getTitle();
        this.description = s.getDescription();
        this.startDate = s.getStartDate();
        this.endDate = s.getEndDate();
        this.completed = s.isCompleted();
        this.assigneeId = s.getAssignee() != null ? s.getAssignee().getId() : null;
        this.assigneeNickname = s.getAssignee() != null ? s.getAssignee().getNickname() : null;
        this.createdAt = s.getCreatedAt();
    }
}
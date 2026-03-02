package com.ascent.ascent_core.domain.kanban.dto;

import com.ascent.ascent_core.domain.kanban.KanbanCard;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
public class KanbanCardResponse {

    private final Long id;
    private final String title;
    private final String description;
    private final String status;
    private final String priority;
    private final LocalDate dueDate;
    private final int position;
    private final Long assigneeId;
    private final String assigneeNickname;
    private final LocalDateTime createdAt;

    public KanbanCardResponse(KanbanCard c) {
        this.id = c.getId();
        this.title = c.getTitle();
        this.description = c.getDescription();
        this.status = c.getStatus().name();
        this.priority = c.getPriority().name();
        this.dueDate = c.getDueDate();
        this.position = c.getPosition();
        this.assigneeId = c.getAssignee() != null ? c.getAssignee().getId() : null;
        this.assigneeNickname = c.getAssignee() != null ? c.getAssignee().getNickname() : null;
        this.createdAt = c.getCreatedAt();
    }
}
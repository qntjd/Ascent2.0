package com.ascent.ascent_core.domain.kanban.dto;

import com.ascent.ascent_core.domain.kanban.KanbanPriority;
import jakarta.validation.constraints.Size;
import lombok.Getter;

import java.time.LocalDate;

@Getter
public class KanbanCardUpdateRequest {

    @Size(max = 100)
    private String title;

    @Size(max = 500)
    private String description;

    private KanbanPriority priority;
    private LocalDate dueDate;
    private Long assigneeId;
}
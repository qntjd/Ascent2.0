package com.ascent.ascent_core.domain.kanban.dto;

import com.ascent.ascent_core.domain.kanban.KanbanStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;

@Getter
public class KanbanCardMoveRequest {

    @NotNull
    private KanbanStatus status;

    private int position;
}
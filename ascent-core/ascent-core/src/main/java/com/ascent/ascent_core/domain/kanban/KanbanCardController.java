package com.ascent.ascent_core.domain.kanban;

import com.ascent.ascent_core.domain.kanban.dto.*;
import com.ascent.ascent_core.global.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects/{projectId}/kanban")
@RequiredArgsConstructor
public class KanbanCardController {

    private final KanbanCardService kanbanCardService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<KanbanCardResponse>>> list(
            @PathVariable Long projectId
    ) {
        return ResponseEntity.ok(ApiResponse.success(kanbanCardService.getCards(projectId)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<KanbanCardResponse>> create(
            @PathVariable Long projectId,
            @AuthenticationPrincipal(expression = "id") Long userId,
            @RequestBody @Valid KanbanCardCreateRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(kanbanCardService.createCard(projectId, userId, request)));
    }

    @PatchMapping("/{cardId}")
    public ResponseEntity<ApiResponse<KanbanCardResponse>> update(
            @PathVariable Long projectId,
            @PathVariable Long cardId,
            @AuthenticationPrincipal(expression = "id") Long userId,
            @RequestBody @Valid KanbanCardUpdateRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                kanbanCardService.updateCard(projectId, cardId, userId, request)));
    }

    @PatchMapping("/{cardId}/move")
    public ResponseEntity<ApiResponse<KanbanCardResponse>> move(
            @PathVariable Long projectId,
            @PathVariable Long cardId,
            @AuthenticationPrincipal(expression = "id") Long userId,
            @RequestBody @Valid KanbanCardMoveRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                kanbanCardService.moveCard(projectId, cardId, userId, request)));
    }

    @DeleteMapping("/{cardId}")
    public ResponseEntity<Void> delete(
            @PathVariable Long projectId,
            @PathVariable Long cardId,
            @AuthenticationPrincipal(expression = "id") Long userId
    ) {
        kanbanCardService.deleteCard(projectId, cardId, userId);
        return ResponseEntity.noContent().build();
    }
}
package com.ascent.ascent_core.chat;

import com.ascent.ascent_core.chat.dto.ChatMessageCreateRequest;
import com.ascent.ascent_core.chat.dto.ChatMessageResponse;
import com.ascent.ascent_core.chat.dto.ChatRoomMemberResponse;
import com.ascent.ascent_core.chat.dto.ChatRoomResponse;
import com.ascent.ascent_core.global.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Sort;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/projects/{projectId}/chat")
public class ChatController {

    private final ChatService chatService;
    private final ChatQueryService chatQueryService;

    // ───────────── 메시지 ─────────────

    @PostMapping("/messages")
    public ResponseEntity<ApiResponse<ChatMessageResponse>> send(
            @PathVariable Long projectId,
            @AuthenticationPrincipal(expression = "id") Long userId,
            @Valid @RequestBody ChatMessageCreateRequest request
    ) {
        ChatMessageResponse response = chatService.sendMessage(projectId, userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response));
    }

    @GetMapping("/messages")
    public ResponseEntity<ApiResponse<Page<ChatMessageResponse>>> list(
        @PathVariable Long projectId,
        @AuthenticationPrincipal(expression = "id") Long userId,
        @RequestParam(required = false) Long cursorId,
        @PageableDefault(size = 20, sort = "id", direction = Sort.Direction.DESC) Pageable pageable
        ) {
        return ResponseEntity.ok(ApiResponse.success(chatService.getMessages(projectId, userId, cursorId, pageable)));
    }

    // ───────────── 채팅방 ─────────────

    /** 특정 프로젝트의 채팅방 단건 조회 */
    @GetMapping("/room")
    public ResponseEntity<ApiResponse<ChatRoomResponse>> getRoom(
            @PathVariable Long projectId
    ) {
        return ResponseEntity.ok(ApiResponse.success(chatQueryService.getRoomByProject(projectId)));
    }

    /** 채팅방 멤버 목록 조회 */
    @GetMapping("/room/members")
    public ResponseEntity<ApiResponse<List<ChatRoomMemberResponse>>> getMembers(
            @PathVariable Long projectId,
            @AuthenticationPrincipal(expression = "id") Long userId
    ) {
        return ResponseEntity.ok(ApiResponse.success(chatQueryService.getRoomMembers(projectId, userId)));
    }
}
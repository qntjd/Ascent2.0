package com.ascent.ascent_core.chat;

import com.ascent.ascent_core.chat.dto.ChatRoomResponse;
import com.ascent.ascent_core.global.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/chat")
public class ChatRoomController {

    private final ChatQueryService chatQueryService;

    /** 내가 속한 채팅방 목록 조회 */
    @GetMapping("/rooms/me")
    public ResponseEntity<ApiResponse<List<ChatRoomResponse>>> getMyRooms(
            @AuthenticationPrincipal(expression = "id") Long userId
    ) {
        return ResponseEntity.ok(ApiResponse.success(chatQueryService.getMyRooms(userId)));
    }
}
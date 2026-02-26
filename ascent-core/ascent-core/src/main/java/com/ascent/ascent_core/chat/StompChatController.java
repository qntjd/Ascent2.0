package com.ascent.ascent_core.chat;

import com.ascent.ascent_core.chat.dto.ChatMessageCreateRequest;
import com.ascent.ascent_core.chat.dto.ChatMessageResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class StompChatController {

    private final ChatService chatService;
    private final SimpMessagingTemplate messagingTemplate;

    
    @MessageMapping("/chat/{projectId}")
    public void sendMessage(
            @DestinationVariable Long projectId,
            @Payload @Valid ChatMessageCreateRequest request,
            Authentication authentication
    ) {
        Long userId = (Long) authentication.getPrincipal();

        ChatMessageResponse response = chatService.sendMessage(projectId, userId, request);

        
        messagingTemplate.convertAndSend("/topic/chat/" + projectId, response);
    }
}
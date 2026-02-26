package com.ascent.ascent_core.chat.dto;

import com.ascent.ascent_core.chat.ChatMessage;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class ChatMessageResponse {

    private final Long id;
    private final Long roomId;
    private final Long senderId;
    private final String senderEmail;
    private final String content;
    private final LocalDateTime createdAt;

    public ChatMessageResponse(ChatMessage m) {
        this.id = m.getId();
        this.roomId = m.getRoom().getId();
        this.senderId = m.getSender().getId();
        this.senderEmail = m.getSender().getEmail();
        this.content = m.getContent();
        this.createdAt = m.getCreatedAt();
    }
}
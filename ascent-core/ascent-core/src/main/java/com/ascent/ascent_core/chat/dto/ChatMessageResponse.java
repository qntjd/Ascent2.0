package com.ascent.ascent_core.chat.dto;

import com.ascent.ascent_core.chat.ChatMessage;
import com.ascent.ascent_core.chat.MessageType;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class ChatMessageResponse {

    private final Long id;
    private final Long roomId;
    private final Long senderId;
    private final String senderEmail;
    private final String senderNickname;
    private final MessageType messageType;
    private final String content;
    private final String fileUrl;
    private final String fileName;
    private final LocalDateTime createdAt;

    public ChatMessageResponse(ChatMessage m) {
        this.id = m.getId();
        this.roomId = m.getRoom().getId();
        this.senderId = m.getSender().getId();
        this.senderEmail = m.getSender().getEmail();
        this.senderNickname = m.getSender().getNickname();
        this.messageType = m.getMessageType();
        this.content = m.getContent();
        this.fileUrl = m.getFileUrl();
        this.fileName = m.getFileName();
        this.createdAt = m.getCreatedAt();
    }
}
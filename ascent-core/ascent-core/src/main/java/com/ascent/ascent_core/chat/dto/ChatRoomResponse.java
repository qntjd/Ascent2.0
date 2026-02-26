package com.ascent.ascent_core.chat.dto;

import com.ascent.ascent_core.chat.ChatRoom;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class ChatRoomResponse {

    private final Long id;
    private final Long projectId;
    private final String projectTitle;
    private final LocalDateTime createdAt;

    public ChatRoomResponse(ChatRoom room) {
        this.id = room.getId();
        this.projectId = room.getProject().getId();
        this.projectTitle = room.getProject().getTitle();
        this.createdAt = room.getCreatedAt();
    }
}
package com.ascent.ascent_core.chat.dto;

import com.ascent.ascent_core.chat.ChatRoomMember;
import com.ascent.ascent_core.chat.ChatRoomMemberRole;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class ChatRoomMemberResponse {

    private final Long userId;
    private final String email;
    private final String nickname;
    private final ChatRoomMemberRole role;
    private final LocalDateTime joinedAt;

    public ChatRoomMemberResponse(ChatRoomMember member) {
        this.userId = member.getUser().getId();
        this.email = member.getUser().getEmail();
        this.nickname = member.getUser().getNickname();
        this.role = member.getRole();
        this.joinedAt = member.getJoinedAt();
    }
}
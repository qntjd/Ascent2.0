package com.ascent.ascent_core.chat;

import com.ascent.ascent_core.domain.user.User;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "chat_room_members",
        uniqueConstraints = @UniqueConstraint(columnNames = {"room_id", "user_id"})
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ChatRoomMember {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "room_id", nullable = false)
    private ChatRoom room;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ChatRoomMemberRole role;

    @Column(nullable = false, updatable = false)
    private LocalDateTime joinedAt;

    public static ChatRoomMember create(ChatRoom room, User user, ChatRoomMemberRole role) {
        ChatRoomMember m = new ChatRoomMember();
        m.room = room;
        m.user = user;
        m.role = role;
        m.joinedAt = LocalDateTime.now();
        return m;
    }
}
package com.ascent.ascent_core.chat;

import com.ascent.ascent_core.domain.user.User;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "chat_messages",
        indexes = {
                @Index(name = "idx_room_created", columnList = "room_id, created_at")
        }
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ChatMessage {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "room_id", nullable = false)
    private ChatRoom room;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "sender_id", nullable = false)
    private User sender;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private MessageType messageType = MessageType.TEXT;

    @Column(nullable = false, length = 2000)
    private String content;

    @Column(length = 500)
    private String fileUrl;

    @Column(length = 200)
    private String fileName;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public static ChatMessage create(ChatRoom room, User sender, String content) {
        ChatMessage m = new ChatMessage();
        m.room = room;
        m.sender = sender;
        m.messageType = MessageType.TEXT;
        m.content = content;
        m.createdAt = LocalDateTime.now();
        return m;
    }

    public static ChatMessage createFile(ChatRoom room, User sender, String fileUrl, String fileName) {
        ChatMessage m = new ChatMessage();
        m.room = room;
        m.sender = sender;
        m.messageType = MessageType.FILE;
        m.content = fileName; // 파일명을 content에도 저장 (하위 호환)
        m.fileUrl = fileUrl;
        m.fileName = fileName;
        m.createdAt = LocalDateTime.now();
        return m;
    }
}
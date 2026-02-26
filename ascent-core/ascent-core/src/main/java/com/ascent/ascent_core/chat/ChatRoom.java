package com.ascent.ascent_core.chat;

import com.ascent.ascent_core.domain.project.Project;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "chat_rooms",
        uniqueConstraints = @UniqueConstraint(columnNames = {"project_id"})
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ChatRoom {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 프로젝트 1개당 채팅방 1개
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "project_id", nullable = false, unique = true)
    private Project project;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public static ChatRoom create(Project project) {
        ChatRoom room = new ChatRoom();
        room.project = project;
        room.createdAt = LocalDateTime.now();
        return room;
    }
}
package com.ascent.ascent_core.domain.project;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "project_invite_codes")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ProjectInviteCode {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @Column(nullable = false, unique = true, length = 36)
    private String code;

    @Column(nullable = false)
    private LocalDateTime expiresAt;

    @Column(nullable = false)
    private boolean active;

    public static ProjectInviteCode create(Project project) {
        ProjectInviteCode invite = new ProjectInviteCode();
        invite.project = project;
        invite.code = UUID.randomUUID().toString();
        invite.expiresAt = LocalDateTime.now().plusDays(7);
        invite.active = true;
        return invite;
    }

    public boolean isExpired() {
        return LocalDateTime.now().isAfter(this.expiresAt);
    }

    public void deactivate() {
        this.active = false;
    }
}
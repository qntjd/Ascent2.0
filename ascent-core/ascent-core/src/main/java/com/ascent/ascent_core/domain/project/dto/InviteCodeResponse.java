package com.ascent.ascent_core.domain.project.dto;

import com.ascent.ascent_core.domain.project.ProjectInviteCode;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class InviteCodeResponse {

    private final String code;
    private final Long projectId;
    private final LocalDateTime expiresAt;

    public InviteCodeResponse(ProjectInviteCode inviteCode) {
        this.code = inviteCode.getCode();
        this.projectId = inviteCode.getProject().getId();
        this.expiresAt = inviteCode.getExpiresAt();
    }
}
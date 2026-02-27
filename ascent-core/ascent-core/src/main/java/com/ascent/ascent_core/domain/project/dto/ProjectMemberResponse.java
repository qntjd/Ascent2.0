package com.ascent.ascent_core.domain.project.dto;

import com.ascent.ascent_core.domain.project.ProjectMember;
import lombok.Getter;

@Getter
public class ProjectMemberResponse {

    private final Long userId;
    private final String email;
    private final String nickname;
    private final String role;
    private final String roleDescription;

    public ProjectMemberResponse(ProjectMember pm) {
        this.userId = pm.getUser().getId();
        this.email = pm.getUser().getEmail();
        this.nickname = pm.getUser().getNickname();
        this.role = pm.getRole().name();
        this.roleDescription = pm.getRoleDescription();
    }
}
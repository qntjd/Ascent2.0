package com.ascent.ascent_core.domain.project.dto;

import com.ascent.ascent_core.domain.project.ProjectMember;
import com.ascent.ascent_core.domain.project.ProjectMemberTag;
import lombok.Getter;

import java.util.List;
import java.util.stream.Collectors;

@Getter
public class ProjectMemberResponse {

    private final Long userId;
    private final String email;
    private final String nickname;
    private final String role;
    private final List<TagResponse> tags;

    public ProjectMemberResponse(ProjectMember pm, List<ProjectMemberTag> tags) {
        this.userId = pm.getUser().getId();
        this.email = pm.getUser().getEmail();
        this.nickname = pm.getUser().getNickname();
        this.role = pm.getRole().name();
        this.tags = tags.stream().map(TagResponse::new).collect(Collectors.toList());
    }

    @Getter
    public static class TagResponse {
        private final Long id;
        private final String tag;

        public TagResponse(ProjectMemberTag t) {
            this.id = t.getId();
            this.tag = t.getTag();
        }
    }
}
package com.ascent.ascent_core.domain.project.dto;

import com.ascent.ascent_core.domain.project.Project;
import com.ascent.ascent_core.domain.project.ProjectStatus;
import lombok.Getter;

@Getter
public class ProjectResponse {

    private final Long id;
    private final String title;
    private final String description;
    private final ProjectStatus status;
    private final Long ownerId;

    public ProjectResponse(Project project) {
        this.id = project.getId();
        this.title = project.getTitle();
        this.description = project.getDescription();
        this.status = project.getStatus();
        this.ownerId = project.getOwner().getId();
    }
}
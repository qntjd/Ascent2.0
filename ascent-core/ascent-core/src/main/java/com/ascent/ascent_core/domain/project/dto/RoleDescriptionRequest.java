package com.ascent.ascent_core.domain.project.dto;

import jakarta.validation.constraints.Size;
import lombok.Getter;

@Getter
public class RoleDescriptionRequest {

    @Size(max = 100)
    private String roleDescription;
}
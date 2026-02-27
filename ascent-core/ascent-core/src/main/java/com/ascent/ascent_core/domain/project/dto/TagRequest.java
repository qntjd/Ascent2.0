package com.ascent.ascent_core.domain.project.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;

@Getter
public class TagRequest {

    @NotBlank
    @Size(max = 30)
    private String tag;
}
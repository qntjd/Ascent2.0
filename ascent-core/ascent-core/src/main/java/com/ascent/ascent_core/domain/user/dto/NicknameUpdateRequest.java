package com.ascent.ascent_core.domain.user.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;

@Getter
public class NicknameUpdateRequest {

    @NotBlank
    @Size(min = 2, max = 20)
    private String nickname;
}
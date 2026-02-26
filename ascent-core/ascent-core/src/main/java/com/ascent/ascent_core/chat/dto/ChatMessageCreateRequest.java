package com.ascent.ascent_core.chat.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;

@Getter
public class ChatMessageCreateRequest {

    @NotBlank
    @Size(max = 2000)
    private String content;
}
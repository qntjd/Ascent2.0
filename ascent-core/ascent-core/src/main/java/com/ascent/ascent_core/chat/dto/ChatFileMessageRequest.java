package com.ascent.ascent_core.chat.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class ChatFileMessageRequest {
    private String fileUrl;
    private String fileName;
}
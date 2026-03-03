package com.ascent.ascent_core.domain.meeting.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;

import java.time.LocalDate;
import java.util.List;

@Getter
public class MeetingCreateRequest {

    @NotBlank @Size(max = 200)
    private String title;

    @NotNull
    private LocalDate meetingDate;

    private String content;

    private LocalDate nextMeetingDate;

    private List<Long> attendeeIds;

    private List<ActionItemRequest> actionItems;

    private List<String> decisions;

    @Getter
    public static class ActionItemRequest {
        @NotBlank @Size(max = 200)
        private String title;
        private Long assigneeId;
        private LocalDate dueDate;
    }
}
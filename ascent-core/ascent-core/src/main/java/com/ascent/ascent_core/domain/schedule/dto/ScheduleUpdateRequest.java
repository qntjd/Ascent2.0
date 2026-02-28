package com.ascent.ascent_core.domain.schedule.dto;

import jakarta.validation.constraints.Size;
import lombok.Getter;

import java.time.LocalDate;

@Getter
public class ScheduleUpdateRequest {

    @Size(max = 100)
    private String title;

    @Size(max = 500)
    private String description;

    private LocalDate startDate;
    private LocalDate endDate;
    private Long assigneeId;
}
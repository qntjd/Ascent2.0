package com.ascent.ascent_core.domain.meeting.dto;

import com.ascent.ascent_core.domain.meeting.Meeting;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
public class MeetingSummaryResponse {

    private final Long id;
    private final String title;
    private final LocalDate meetingDate;
    private final String authorNickname;
    private final int actionItemCount;
    private final int decisionCount;
    private final LocalDateTime createdAt;

    public MeetingSummaryResponse(Meeting m) {
        this.id = m.getId();
        this.title = m.getTitle();
        this.meetingDate = m.getMeetingDate();
        this.authorNickname = m.getAuthor().getNickname();
        this.actionItemCount = m.getActionItems().size();
        this.decisionCount = m.getDecisions().size();
        this.createdAt = m.getCreatedAt();
    }
}
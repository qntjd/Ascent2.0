package com.ascent.ascent_core.domain.meeting;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "meeting_decisions")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class MeetingDecision {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "meeting_id", nullable = false)
    private Meeting meeting;

    @Column(nullable = false, length = 500)
    private String content;

    public static MeetingDecision of(Meeting meeting, String content) {
        MeetingDecision d = new MeetingDecision();
        d.meeting = meeting;
        d.content = content;
        return d;
    }
}
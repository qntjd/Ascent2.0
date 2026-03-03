package com.ascent.ascent_core.domain.meeting;

import com.ascent.ascent_core.domain.user.User;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "meeting_attendees")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class MeetingAttendee {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "meeting_id", nullable = false)
    private Meeting meeting;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    public static MeetingAttendee of(Meeting meeting, User user) {
        MeetingAttendee a = new MeetingAttendee();
        a.meeting = meeting;
        a.user = user;
        return a;
    }
}
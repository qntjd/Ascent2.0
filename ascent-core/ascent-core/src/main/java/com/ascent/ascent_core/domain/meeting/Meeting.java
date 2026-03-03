package com.ascent.ascent_core.domain.meeting;

import com.ascent.ascent_core.domain.project.Project;
import com.ascent.ascent_core.domain.user.User;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "meetings")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Meeting {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "author_id", nullable = false)
    private User author;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false)
    private LocalDate meetingDate;

    @Column(columnDefinition = "TEXT")
    private String content;

    private LocalDate nextMeetingDate;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "meeting", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<MeetingAttendee> attendees = new ArrayList<>();

    @OneToMany(mappedBy = "meeting", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<MeetingActionItem> actionItems = new ArrayList<>();

    @OneToMany(mappedBy = "meeting", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<MeetingDecision> decisions = new ArrayList<>();

    public static Meeting create(Project project, User author, String title,
                                  LocalDate meetingDate, String content, LocalDate nextMeetingDate) {
        Meeting m = new Meeting();
        m.project = project;
        m.author = author;
        m.title = title;
        m.meetingDate = meetingDate;
        m.content = content;
        m.nextMeetingDate = nextMeetingDate;
        m.createdAt = LocalDateTime.now();
        return m;
    }

    public void update(String title, LocalDate meetingDate, String content, LocalDate nextMeetingDate) {
        if (title != null) this.title = title;
        if (meetingDate != null) this.meetingDate = meetingDate;
        if (content != null) this.content = content;
        this.nextMeetingDate = nextMeetingDate;
    }
}
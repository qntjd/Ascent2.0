package com.ascent.ascent_core.domain.meeting;

import com.ascent.ascent_core.domain.user.User;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "meeting_action_items")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class MeetingActionItem {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "meeting_id", nullable = false)
    private Meeting meeting;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assignee_id")
    private User assignee;

    @Column(nullable = false, length = 200)
    private String title;

    private LocalDate dueDate;

    @Column(nullable = false)
    private boolean linkedToKanban = false;

    public static MeetingActionItem create(Meeting meeting, User assignee, String title, LocalDate dueDate) {
        MeetingActionItem item = new MeetingActionItem();
        item.meeting = meeting;
        item.assignee = assignee;
        item.title = title;
        item.dueDate = dueDate;
        return item;
    }

    public void markLinkedToKanban() {
        this.linkedToKanban = true;
    }
}
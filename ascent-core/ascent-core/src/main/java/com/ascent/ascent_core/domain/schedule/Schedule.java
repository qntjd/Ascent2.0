package com.ascent.ascent_core.domain.schedule;

import com.ascent.ascent_core.domain.project.Project;
import com.ascent.ascent_core.domain.user.User;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "schedules")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Schedule {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assignee_id")
    private User assignee;

    @Column(nullable = false, length = 100)
    private String title;

    @Column(length = 500)
    private String description;

    @Column(nullable = false)
    private LocalDate startDate;

    @Column(nullable = false)
    private LocalDate endDate;

    @Column(nullable = false)
    private boolean completed;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public static Schedule create(Project project, User assignee, String title, String description,
                                   LocalDate startDate, LocalDate endDate) {
        Schedule s = new Schedule();
        s.project = project;
        s.assignee = assignee;
        s.title = title;
        s.description = description;
        s.startDate = startDate;
        s.endDate = endDate;
        s.completed = false;
        s.createdAt = LocalDateTime.now();
        return s;
    }

    public void update(String title, String description, LocalDate startDate, LocalDate endDate, User assignee) {
        if (title != null) this.title = title;
        if (description != null) this.description = description;
        if (startDate != null) this.startDate = startDate;
        if (endDate != null) this.endDate = endDate;
        if (assignee != null) this.assignee = assignee;
    }

    public void toggleComplete() {
        this.completed = !this.completed;
    }
}
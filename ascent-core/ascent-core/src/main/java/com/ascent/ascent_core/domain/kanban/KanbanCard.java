package com.ascent.ascent_core.domain.kanban;

import com.ascent.ascent_core.domain.project.Project;
import com.ascent.ascent_core.domain.user.User;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;


import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "kanban_cards")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class KanbanCard {

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

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private KanbanStatus status;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private KanbanPriority priority;

    private LocalDate dueDate;

    @Column(nullable = false)
    private int position;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public static KanbanCard create(Project project, User assignee, String title,
                                     String description, KanbanPriority priority,
                                     LocalDate dueDate, int position) {
        KanbanCard c = new KanbanCard();
        c.project = project;
        c.assignee = assignee;
        c.title = title;
        c.description = description;
        c.status = KanbanStatus.TODO;
        c.priority = priority != null ? priority : KanbanPriority.MEDIUM;
        c.dueDate = dueDate;
        c.position = position;
        c.createdAt = LocalDateTime.now();
        return c;
    }

    public void update(String title, String description, KanbanPriority priority,
                       LocalDate dueDate, User assignee) {
        if (title != null) this.title = title;
        if (description != null) this.description = description;
        if (priority != null) this.priority = priority;
        if (dueDate != null) this.dueDate = dueDate;
        if (assignee != null) this.assignee = assignee;
    }

    public void moveToStatus(KanbanStatus status, int position) {
        this.status = status;
        this.position = position;
    }
}
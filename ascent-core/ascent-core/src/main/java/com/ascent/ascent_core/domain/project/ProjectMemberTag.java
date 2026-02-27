package com.ascent.ascent_core.domain.project;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "project_member_tags")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ProjectMemberTag {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "project_member_id", nullable = false)
    private ProjectMember projectMember;

    @Column(nullable = false, length = 30)
    private String tag;

    public static ProjectMemberTag create(ProjectMember projectMember, String tag) {
        ProjectMemberTag t = new ProjectMemberTag();
        t.projectMember = projectMember;
        t.tag = tag;
        return t;
    }
}
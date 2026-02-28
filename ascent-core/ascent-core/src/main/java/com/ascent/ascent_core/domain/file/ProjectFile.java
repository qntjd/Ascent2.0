package com.ascent.ascent_core.domain.file;

import com.ascent.ascent_core.domain.project.Project;
import com.ascent.ascent_core.domain.user.User;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "project_files")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ProjectFile {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "uploader_id", nullable = false)
    private User uploader;

    @Column(nullable = false, length = 255)
    private String originalName;

    @Column(nullable = false, length = 500)
    private String url;

    @Column(nullable = false, length = 100)
    private String publicId;

    @Column(nullable = false, length = 50)
    private String fileType;

    @Column(nullable = false)
    private Long fileSize;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public static ProjectFile create(Project project, User uploader, String originalName,
                                      String url, String publicId, String fileType, Long fileSize) {
        ProjectFile f = new ProjectFile();
        f.project = project;
        f.uploader = uploader;
        f.originalName = originalName;
        f.url = url;
        f.publicId = publicId;
        f.fileType = fileType;
        f.fileSize = fileSize;
        f.createdAt = LocalDateTime.now();
        return f;
    }
}
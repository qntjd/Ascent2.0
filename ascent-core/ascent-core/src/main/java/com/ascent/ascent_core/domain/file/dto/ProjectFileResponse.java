package com.ascent.ascent_core.domain.file.dto;

import com.ascent.ascent_core.domain.file.ProjectFile;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class ProjectFileResponse {

    private final Long id;
    private final String originalName;
    private final String url;
    private final String fileType;
    private final Long fileSize;
    private final Long uploaderId;
    private final String uploaderNickname;
    private final LocalDateTime createdAt;

    public ProjectFileResponse(ProjectFile f) {
        this.id = f.getId();
        this.originalName = f.getOriginalName();
        this.url = f.getUrl();
        this.fileType = f.getFileType();
        this.fileSize = f.getFileSize();
        this.uploaderId = f.getUploader().getId();
        this.uploaderNickname = f.getUploader().getNickname();
        this.createdAt = f.getCreatedAt();
    }
}
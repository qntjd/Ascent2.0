package com.ascent.ascent_core.domain.file;

import com.ascent.ascent_core.domain.file.dto.ProjectFileResponse;
import com.ascent.ascent_core.global.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/projects/{projectId}/files")
@RequiredArgsConstructor
public class ProjectFileController {

    private final ProjectFileService projectFileService;

    // 파일 목록 조회
    @GetMapping
    public ResponseEntity<ApiResponse<List<ProjectFileResponse>>> list(
            @PathVariable Long projectId
    ) {
        return ResponseEntity.ok(ApiResponse.success(projectFileService.getFiles(projectId)));
    }

    // 파일 업로드
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<ProjectFileResponse>> upload(
            @PathVariable Long projectId,
            @AuthenticationPrincipal(expression = "id") Long userId,
            @RequestParam("file") MultipartFile file
    ) {
        return ResponseEntity.ok(ApiResponse.success(projectFileService.uploadFile(projectId, userId, file)));
    }

    // 파일 삭제
    @DeleteMapping("/{fileId}")
    public ResponseEntity<Void> delete(
            @PathVariable Long projectId,
            @PathVariable Long fileId,
            @AuthenticationPrincipal(expression = "id") Long userId
    ) {
        projectFileService.deleteFile(projectId, fileId, userId);
        return ResponseEntity.noContent().build();
    }
}
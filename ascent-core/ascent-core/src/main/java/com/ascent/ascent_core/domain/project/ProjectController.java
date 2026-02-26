package com.ascent.ascent_core.domain.project;

import com.ascent.ascent_core.domain.project.dto.InviteCodeResponse;
import com.ascent.ascent_core.domain.project.dto.ProjectCreateRequest;
import com.ascent.ascent_core.domain.project.dto.ProjectResponse;
import com.ascent.ascent_core.global.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;

    @PostMapping
    public ResponseEntity<ApiResponse<ProjectResponse>> create(
            @AuthenticationPrincipal(expression = "id") Long userId,
            @Valid @RequestBody ProjectCreateRequest request
    ) {
        ProjectResponse response = projectService.createProject(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<ProjectResponse>>> list(Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(projectService.getProjects(pageable)));
    }

    @GetMapping("/{projectId}")
    public ResponseEntity<ApiResponse<ProjectResponse>> detail(@PathVariable Long projectId) {
        return ResponseEntity.ok(ApiResponse.success(projectService.getProject(projectId)));
    }

    /** 초대 코드 생성 - OWNER만 가능 */
    @PostMapping("/{projectId}/invite-code")
    public ResponseEntity<ApiResponse<InviteCodeResponse>> createInviteCode(
            @PathVariable Long projectId,
            @AuthenticationPrincipal(expression = "id") Long userId
    ) {
        InviteCodeResponse response = projectService.createInviteCode(projectId, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response));
    }

    /** 초대 코드로 프로젝트 참여 */
    @PostMapping("/join")
    public ResponseEntity<ApiResponse<ProjectResponse>> join(
            @RequestParam String code,
            @AuthenticationPrincipal(expression = "id") Long userId
    ) {
        ProjectResponse response = projectService.joinByInviteCode(code, userId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
package com.ascent.ascent_core.domain.project;

import com.ascent.ascent_core.domain.project.dto.InviteCodeResponse;
import com.ascent.ascent_core.domain.project.dto.ProjectCreateRequest;
import com.ascent.ascent_core.domain.project.dto.ProjectMemberResponse;
import com.ascent.ascent_core.domain.project.dto.ProjectResponse;
import com.ascent.ascent_core.domain.project.dto.RoleDescriptionRequest;
import com.ascent.ascent_core.global.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(projectService.createProject(userId, request)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<ProjectResponse>>> list(
            @AuthenticationPrincipal(expression = "id") Long userId,
            Pageable pageable
    ) {
        return ResponseEntity.ok(ApiResponse.success(projectService.getProjects(userId, pageable)));
    }

    @GetMapping("/{projectId}")
    public ResponseEntity<ApiResponse<ProjectResponse>> detail(@PathVariable Long projectId) {
        return ResponseEntity.ok(ApiResponse.success(projectService.getProject(projectId)));
    }

    // 프로젝트 멤버 목록 조회
    @GetMapping("/{projectId}/members")
    public ResponseEntity<ApiResponse<List<ProjectMemberResponse>>> members(
            @PathVariable Long projectId
    ) {
        return ResponseEntity.ok(ApiResponse.success(projectService.getProjectMembers(projectId)));
    }

    // 역할 설명 수정 (OWNER만 가능)
    @PatchMapping("/{projectId}/members/{targetUserId}/role")
    public ResponseEntity<ApiResponse<ProjectMemberResponse>> updateRole(
            @PathVariable Long projectId,
            @PathVariable Long targetUserId,
            @AuthenticationPrincipal(expression = "id") Long requesterId,
            @RequestBody @Valid RoleDescriptionRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                projectService.updateRoleDescription(projectId, targetUserId, requesterId, request)));
    }

    @PostMapping("/{projectId}/invite-code")
    public ResponseEntity<ApiResponse<InviteCodeResponse>> createInviteCode(
            @PathVariable Long projectId,
            @AuthenticationPrincipal(expression = "id") Long userId
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(projectService.createInviteCode(projectId, userId)));
    }

    @PostMapping("/join")
    public ResponseEntity<ApiResponse<ProjectResponse>> join(
            @RequestParam String code,
            @AuthenticationPrincipal(expression = "id") Long userId
    ) {
        return ResponseEntity.ok(ApiResponse.success(projectService.joinByInviteCode(code, userId)));
    }
}
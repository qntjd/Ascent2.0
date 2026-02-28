package com.ascent.ascent_core.domain.schedule;

import com.ascent.ascent_core.domain.schedule.dto.ScheduleCreateRequest;
import com.ascent.ascent_core.domain.schedule.dto.ScheduleResponse;
import com.ascent.ascent_core.domain.schedule.dto.ScheduleUpdateRequest;
import com.ascent.ascent_core.global.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects/{projectId}/schedules")
@RequiredArgsConstructor
public class ScheduleController {

    private final ScheduleService scheduleService;

    // 일정 목록 조회
    @GetMapping
    public ResponseEntity<ApiResponse<List<ScheduleResponse>>> list(
            @PathVariable Long projectId
    ) {
        return ResponseEntity.ok(ApiResponse.success(scheduleService.getSchedules(projectId)));
    }

    // 일정 생성
    @PostMapping
    public ResponseEntity<ApiResponse<ScheduleResponse>> create(
            @PathVariable Long projectId,
            @AuthenticationPrincipal(expression = "id") Long userId,
            @RequestBody @Valid ScheduleCreateRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(scheduleService.createSchedule(projectId, userId, request)));
    }

    // 일정 수정
    @PatchMapping("/{scheduleId}")
    public ResponseEntity<ApiResponse<ScheduleResponse>> update(
            @PathVariable Long projectId,
            @PathVariable Long scheduleId,
            @AuthenticationPrincipal(expression = "id") Long userId,
            @RequestBody @Valid ScheduleUpdateRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                scheduleService.updateSchedule(projectId, scheduleId, userId, request)));
    }

    // 완료 토글
    @PatchMapping("/{scheduleId}/toggle")
    public ResponseEntity<ApiResponse<ScheduleResponse>> toggle(
            @PathVariable Long projectId,
            @PathVariable Long scheduleId,
            @AuthenticationPrincipal(expression = "id") Long userId
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                scheduleService.toggleComplete(projectId, scheduleId, userId)));
    }

    // 일정 삭제
    @DeleteMapping("/{scheduleId}")
    public ResponseEntity<Void> delete(
            @PathVariable Long projectId,
            @PathVariable Long scheduleId,
            @AuthenticationPrincipal(expression = "id") Long userId
    ) {
        scheduleService.deleteSchedule(projectId, scheduleId, userId);
        return ResponseEntity.noContent().build();
    }
}
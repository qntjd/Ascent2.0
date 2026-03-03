package com.ascent.ascent_core.domain.meeting;

import com.ascent.ascent_core.domain.meeting.dto.MeetingCreateRequest;
import com.ascent.ascent_core.domain.meeting.dto.MeetingResponse;
import com.ascent.ascent_core.domain.meeting.dto.MeetingSummaryResponse;
import com.ascent.ascent_core.global.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class MeetingController {

    private final MeetingService meetingService;

    @GetMapping("/api/projects/{projectId}/meetings")
    public ResponseEntity<ApiResponse<List<MeetingSummaryResponse>>> list(@PathVariable Long projectId) {
        return ResponseEntity.ok(ApiResponse.success(meetingService.getMeetings(projectId)));
    }

    @GetMapping("/api/meetings/{meetingId}")
    public ResponseEntity<ApiResponse<MeetingResponse>> get(@PathVariable Long meetingId) {
        return ResponseEntity.ok(ApiResponse.success(meetingService.getMeeting(meetingId)));
    }

    @PostMapping("/api/projects/{projectId}/meetings")
    public ResponseEntity<ApiResponse<MeetingResponse>> create(
            @PathVariable Long projectId,
            @AuthenticationPrincipal(expression = "id") Long userId,
            @RequestBody @Valid MeetingCreateRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(meetingService.createMeeting(projectId, userId, request)));
    }

    @PostMapping("/api/projects/{projectId}/meetings/{meetingId}/action-items/{actionItemId}/link-kanban")
    public ResponseEntity<ApiResponse<MeetingResponse>> linkKanban(
            @PathVariable Long projectId,
            @PathVariable Long meetingId,
            @PathVariable Long actionItemId,
            @AuthenticationPrincipal(expression = "id") Long userId
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                meetingService.linkActionItemToKanban(projectId, meetingId, actionItemId, userId)));
    }

    @DeleteMapping("/api/projects/{projectId}/meetings/{meetingId}")
    public ResponseEntity<Void> delete(
            @PathVariable Long projectId,
            @PathVariable Long meetingId,
            @AuthenticationPrincipal(expression = "id") Long userId
    ) {
        meetingService.deleteMeeting(projectId, meetingId, userId);
        return ResponseEntity.noContent().build();
    }
}
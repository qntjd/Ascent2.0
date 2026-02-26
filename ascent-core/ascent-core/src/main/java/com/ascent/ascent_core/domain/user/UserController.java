package com.ascent.ascent_core.domain.user;

import com.ascent.ascent_core.domain.user.dto.NicknameUpdateRequest;
import com.ascent.ascent_core.domain.user.dto.UserResponse;
import com.ascent.ascent_core.global.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    // @PostMapping("/signup")
    // @ResponseStatus(HttpStatus.CREATED)
    // public UserResponse signUp(@RequestBody @Valid UserCreateRequest request) {
    //     return userService.signUp(request);
    // }

    /** 내 정보 조회 */
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> getMe(
            @AuthenticationPrincipal(expression = "id") Long userId
    ) {
        return ResponseEntity.ok(ApiResponse.success(userService.getMe(userId)));
    }

    /** 닉네임 수정 */
    @PatchMapping("/me/nickname")
    public ResponseEntity<ApiResponse<UserResponse>> updateNickname(
            @AuthenticationPrincipal(expression = "id") Long userId,
            @RequestBody @Valid NicknameUpdateRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(userService.updateNickname(userId, request)));
    }
}
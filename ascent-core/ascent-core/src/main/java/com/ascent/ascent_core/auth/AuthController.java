package com.ascent.ascent_core.auth;

import com.ascent.ascent_core.auth.dto.LoginRequest;
import com.ascent.ascent_core.auth.dto.LoginResponse;
import com.ascent.ascent_core.domain.user.dto.UserCreateRequest;
import com.ascent.ascent_core.domain.user.dto.UserResponse;
import com.ascent.ascent_core.domain.user.UserService;
import com.ascent.ascent_core.global.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;
    private final AuthService authService;

    /**
     * 회원가입
     */
    @PostMapping("/users/signup")
    public ResponseEntity<ApiResponse<UserResponse>> signUp(
            @Valid @RequestBody UserCreateRequest request
    ) {

        UserResponse response = userService.signUp(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(response));
    }

    /**
     * 로그인 (Access + Refresh 반환)
     */
    @PostMapping("/auth/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(
            @Valid @RequestBody LoginRequest request
    ) {

        LoginResponse response = authService.login(
                request.getEmail(),
                request.getPassword()
        );

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * AccessToken 재발급
     */
    @PostMapping("/auth/reissue")
    public ResponseEntity<ApiResponse<String>> reissue(
            @RequestHeader("Refresh-Token") String refreshToken
    ) {

        String newAccessToken = authService.reissue(refreshToken);

        return ResponseEntity.ok(ApiResponse.success(newAccessToken));
    }

    /**
     * 로그아웃 (RefreshToken 삭제)
     */
    @PostMapping("/auth/logout")
    public ResponseEntity<ApiResponse<Void>> logout(
            @AuthenticationPrincipal(expression = "id") Long userId
    ) {

        authService.logout(userId);

        return ResponseEntity.ok(ApiResponse.success());
    }
}

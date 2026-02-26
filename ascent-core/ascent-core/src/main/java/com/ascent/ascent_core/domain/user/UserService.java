package com.ascent.ascent_core.domain.user;

import com.ascent.ascent_core.domain.user.dto.NicknameUpdateRequest;
import com.ascent.ascent_core.domain.user.dto.UserCreateRequest;
import com.ascent.ascent_core.domain.user.dto.UserResponse;
import com.ascent.ascent_core.global.exception.CustomException;
import com.ascent.ascent_core.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public UserResponse signUp(UserCreateRequest request) {
        String encodedPassword = passwordEncoder.encode(request.getPassword());
        User user = User.create(request.getEmail(), encodedPassword, request.getNickname());
        userRepository.save(user);
        return new UserResponse(user);
    }

    /**
     * 내 정보 조회
     */
    public UserResponse getMe(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
        return new UserResponse(user);
    }

    /**
     * 닉네임 수정
     */
    @Transactional
    public UserResponse updateNickname(Long userId, NicknameUpdateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
        user.changeNickname(request.getNickname());
        return new UserResponse(user);
    }
}
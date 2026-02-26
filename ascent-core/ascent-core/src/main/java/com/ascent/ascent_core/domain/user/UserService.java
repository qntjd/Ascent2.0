package com.ascent.ascent_core.domain.user;

import com.ascent.ascent_core.domain.user.dto.UserCreateRequest;
import com.ascent.ascent_core.domain.user.dto.UserResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserResponse signUp(UserCreateRequest request) {
        
        String encodedPassword = passwordEncoder.encode(request.getPassword());

        // User 생성 
        User user = User.create(
                request.getEmail(),
                encodedPassword,
                request.getNickname()
        );

        
        userRepository.save(user);

        
        return new UserResponse(user);
    }
}

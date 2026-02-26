package com.ascent.ascent_core.auth;

import com.ascent.ascent_core.domain.user.User;
import com.ascent.ascent_core.domain.user.UserRepository;
import com.ascent.ascent_core.global.exception.CustomException;
import com.ascent.ascent_core.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;


    @Override
    public UserDetails loadUserByUsername(String email) {
    String normalizedEmail = email.trim();

    User user = userRepository.findByEmail(normalizedEmail)
            .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

    return new CustomUserDetails(user);
    }
}

package com.ascent.ascent_core.domain.user;

import com.ascent.ascent_core.domain.user.dto.UserCreateRequest;
import com.ascent.ascent_core.domain.user.dto.UserResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
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
}

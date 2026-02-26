package com.ascent.ascent_core.auth.refresh;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Repository;

import java.time.Duration;

@Repository
@RequiredArgsConstructor
public class RefreshTokenRepository {

    private final RedisTemplate<String, String> redisTemplate;

    private static final String PREFIX = "RT:";

    public void save(Long userId, String refreshToken, long expirationMillis) {
        redisTemplate.opsForValue()
                .set(PREFIX + userId, refreshToken,
                        Duration.ofMillis(expirationMillis));
    }

    public String findByUserId(Long userId) {
        return redisTemplate.opsForValue()
                .get(PREFIX + userId);
    }

    public void delete(Long userId) {
        redisTemplate.delete(PREFIX + userId);
    }
}

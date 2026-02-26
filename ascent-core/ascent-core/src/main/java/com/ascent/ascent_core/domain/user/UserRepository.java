package com.ascent.ascent_core.domain.user;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * 이메일로 사용자 조회 (로그인 / 일반 조회)
     */
    Optional<User> findByEmail(String email);

    /**
     * 활성 상태 사용자만 조회 (로그인 전용)
     */
    Optional<User> findByEmailAndStatus(String email, UserStatus status);

    /**
     * ID + 상태 기반 조회 (탈퇴/비활성 제외 조회용)
     */
    Optional<User> findByIdAndStatus(Long id, UserStatus status);

    
    boolean existsByEmail(String email);
}

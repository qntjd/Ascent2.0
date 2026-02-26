package com.ascent.ascent_core.domain.project;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ProjectInviteCodeRepository extends JpaRepository<ProjectInviteCode, Long> {

    Optional<ProjectInviteCode> findByCode(String code);
}
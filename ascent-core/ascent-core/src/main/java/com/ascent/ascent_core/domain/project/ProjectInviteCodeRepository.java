package com.ascent.ascent_core.domain.project;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface ProjectInviteCodeRepository extends JpaRepository<ProjectInviteCode, Long> {

    Optional<ProjectInviteCode> findByCode(String code);

    @Query("SELECT p FROM ProjectInviteCode p WHERE p.project.id = :projectId AND p.active = true ORDER BY p.expiresAt DESC")
    Optional<ProjectInviteCode> findActiveByProjectId(@Param("projectId") Long projectId);
}
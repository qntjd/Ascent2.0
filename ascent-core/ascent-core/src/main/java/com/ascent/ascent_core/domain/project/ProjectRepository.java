package com.ascent.ascent_core.domain.project;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ProjectRepository extends JpaRepository<Project, Long> {

    @Query("SELECT p FROM Project p JOIN ProjectMember pm ON pm.project = p WHERE pm.user.id = :userId")
    Page<Project> findAllByMemberUserId(@Param("userId") Long userId, Pageable pageable);
}
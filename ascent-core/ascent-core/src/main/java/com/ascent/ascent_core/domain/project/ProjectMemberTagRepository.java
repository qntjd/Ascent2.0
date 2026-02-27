package com.ascent.ascent_core.domain.project;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProjectMemberTagRepository extends JpaRepository<ProjectMemberTag, Long> {

    List<ProjectMemberTag> findAllByProjectMemberId(Long projectMemberId);

    Optional<ProjectMemberTag> findByIdAndProjectMemberId(Long id, Long projectMemberId);

    void deleteByIdAndProjectMemberId(Long id, Long projectMemberId);
}
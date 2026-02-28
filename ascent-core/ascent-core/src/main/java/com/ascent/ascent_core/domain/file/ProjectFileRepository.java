package com.ascent.ascent_core.domain.file;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProjectFileRepository extends JpaRepository<ProjectFile, Long> {

    List<ProjectFile> findAllByProjectIdOrderByCreatedAtDesc(Long projectId);
}
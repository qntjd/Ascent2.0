package com.ascent.ascent_core.domain.schedule;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ScheduleRepository extends JpaRepository<Schedule, Long> {

    List<Schedule> findAllByProjectIdOrderByStartDateAsc(Long projectId);
}
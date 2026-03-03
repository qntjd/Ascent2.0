package com.ascent.ascent_core.domain.meeting;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface MeetingRepository extends JpaRepository<Meeting, Long> {

    List<Meeting> findAllByProjectIdOrderByMeetingDateDesc(Long projectId);

    @Query("SELECT m FROM Meeting m LEFT JOIN FETCH m.attendees a LEFT JOIN FETCH a.user LEFT JOIN FETCH m.actionItems ai LEFT JOIN FETCH ai.assignee LEFT JOIN FETCH m.decisions WHERE m.id = :id")
    Optional<Meeting> findByIdWithDetails(@Param("id") Long id);
}
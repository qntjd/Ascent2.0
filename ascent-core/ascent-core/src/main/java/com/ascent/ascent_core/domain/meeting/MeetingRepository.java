package com.ascent.ascent_core.domain.meeting;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface MeetingRepository extends JpaRepository<Meeting, Long> {

    List<Meeting> findAllByProjectIdOrderByMeetingDateDesc(Long projectId);

    // attendees만 fetch join
    @Query("SELECT DISTINCT m FROM Meeting m LEFT JOIN FETCH m.attendees a LEFT JOIN FETCH a.user WHERE m.id = :id")
    Optional<Meeting> findByIdWithAttendees(@Param("id") Long id);
    // actionItems + decisions 를 분리
    @Query("SELECT DISTINCT m FROM Meeting m LEFT JOIN FETCH m.actionItems ai LEFT JOIN FETCH ai.assignee WHERE m.id = :id")
    Optional<Meeting> findByIdWithActionItems(@Param("id") Long id);

    @Query("SELECT DISTINCT m FROM Meeting m LEFT JOIN FETCH m.decisions WHERE m.id = :id")
    Optional<Meeting> findByIdWithDecisions(@Param("id") Long id);
}
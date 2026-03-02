package com.ascent.ascent_core.domain.kanban;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface KanbanCardRepository extends JpaRepository<KanbanCard, Long> {

    List<KanbanCard> findAllByProjectIdOrderByStatusAscPositionAsc(Long projectId);

    int countByProjectIdAndStatus(Long projectId, KanbanStatus status);
    
}

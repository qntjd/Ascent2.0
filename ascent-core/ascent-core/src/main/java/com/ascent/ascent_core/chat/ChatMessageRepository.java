package com.ascent.ascent_core.chat;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    // 최신순 페이징
    Page<ChatMessage> findByRoomIdOrderByIdDesc(Long roomId, Pageable pageable);

    // cursor 기반(이전 메시지 더보기)
    Page<ChatMessage> findByRoomIdAndIdLessThanOrderByIdDesc(Long roomId, Long cursorId, Pageable pageable);
}
package com.ascent.ascent_core.chat;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ChatRoomMemberRepository extends JpaRepository<ChatRoomMember, Long> {

    // 채팅방 멤버 목록 조회
    List<ChatRoomMember> findByRoomId(Long roomId);

    // 내가 속한 채팅방 목록 조회용
    List<ChatRoomMember> findByUserId(Long userId);

    // 멤버 여부 확인
    Optional<ChatRoomMember> findByRoomIdAndUserId(Long roomId, Long userId);
}
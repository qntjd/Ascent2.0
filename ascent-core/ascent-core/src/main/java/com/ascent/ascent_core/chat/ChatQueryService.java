package com.ascent.ascent_core.chat;

import com.ascent.ascent_core.chat.dto.ChatRoomMemberResponse;
import com.ascent.ascent_core.chat.dto.ChatRoomResponse;
import com.ascent.ascent_core.global.exception.CustomException;
import com.ascent.ascent_core.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ChatQueryService {

    private final ChatRoomRepository chatRoomRepository;
    private final ChatRoomMemberRepository chatRoomMemberRepository;

    /**
     * 특정 프로젝트의 채팅방 단건 조회
     */
    public ChatRoomResponse getRoomByProject(Long projectId) {
        ChatRoom room = chatRoomRepository.findByProjectId(projectId)
                .orElseThrow(() -> new CustomException(ErrorCode.CHAT_ROOM_NOT_FOUND));
        return new ChatRoomResponse(room);
    }

    /**
     * 내가 속한 채팅방 목록 조회
     */
    public List<ChatRoomResponse> getMyRooms(Long userId) {
        return chatRoomMemberRepository.findByUserId(userId).stream()
                .map(member -> new ChatRoomResponse(member.getRoom()))
                .collect(Collectors.toList());
    }

    /**
     * 채팅방 멤버 목록 조회 - 본인이 해당 채팅방 멤버인 경우만 가능
     */
    public List<ChatRoomMemberResponse> getRoomMembers(Long projectId, Long userId) {
        ChatRoom room = chatRoomRepository.findByProjectId(projectId)
                .orElseThrow(() -> new CustomException(ErrorCode.CHAT_ROOM_NOT_FOUND));

        // 본인이 멤버인지 체크
        chatRoomMemberRepository.findByRoomIdAndUserId(room.getId(), userId)
                .orElseThrow(() -> new CustomException(ErrorCode.FORBIDDEN));

        return chatRoomMemberRepository.findByRoomId(room.getId()).stream()
                .map(ChatRoomMemberResponse::new)
                .collect(Collectors.toList());
    }
}
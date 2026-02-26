package com.ascent.ascent_core.chat;

import com.ascent.ascent_core.chat.dto.ChatMessageCreateRequest;
import com.ascent.ascent_core.chat.dto.ChatMessageResponse;
import com.ascent.ascent_core.domain.project.ProjectMemberRepository;
import com.ascent.ascent_core.domain.user.User;
import com.ascent.ascent_core.domain.user.UserRepository;
import com.ascent.ascent_core.global.exception.CustomException;
import com.ascent.ascent_core.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ChatService {

    private final ChatRoomRepository chatRoomRepository;
    private final ChatRoomMemberRepository chatRoomMemberRepository;
    private final ChatMessageRepository chatMessageRepository;

    private final ProjectMemberRepository projectMemberRepository;
    private final UserRepository userRepository;

    
    @Transactional
    public ChatMessageResponse sendMessage(Long projectId, Long userId, ChatMessageCreateRequest request) {

        
        projectMemberRepository.findByProjectIdAndUserId(projectId, userId)
                .orElseThrow(() -> new CustomException(ErrorCode.FORBIDDEN));

        //프로젝트의 채팅방 찾기 (1:1)
        ChatRoom room = chatRoomRepository.findByProjectId(projectId)
                .orElseThrow(() -> new CustomException(ErrorCode.CHAT_ROOM_NOT_FOUND));

        //사용자 조회
        User sender = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

       
        ChatMessage message = ChatMessage.create(room, sender, request.getContent());
        chatMessageRepository.save(message);

        return new ChatMessageResponse(message);
    }

    
    public Page<ChatMessageResponse> getMessages(Long projectId, Long userId, Long cursorId, Pageable pageable) {

        projectMemberRepository.findByProjectIdAndUserId(projectId, userId)
                .orElseThrow(() -> new CustomException(ErrorCode.FORBIDDEN));

        ChatRoom room = chatRoomRepository.findByProjectId(projectId)
                .orElseThrow(() -> new CustomException(ErrorCode.CHAT_ROOM_NOT_FOUND));

        
        Pageable fixedPageable = PageRequest.of(
                pageable.getPageNumber(),
                pageable.getPageSize(),
                Sort.by(Sort.Direction.DESC, "id")
        );

        if (cursorId == null) {
                return chatMessageRepository.findByRoomIdOrderByIdDesc(room.getId(), fixedPageable)
                        .map(ChatMessageResponse::new);
        }

        return chatMessageRepository.findByRoomIdAndIdLessThanOrderByIdDesc(room.getId(), cursorId, fixedPageable)
                .map(ChatMessageResponse::new);
    }
}
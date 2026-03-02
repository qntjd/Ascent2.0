package com.ascent.ascent_core.domain.kanban;

import com.ascent.ascent_core.domain.kanban.dto.*;
import com.ascent.ascent_core.domain.project.Project;
import com.ascent.ascent_core.domain.project.ProjectMemberRepository;
import com.ascent.ascent_core.domain.project.ProjectRepository;
import com.ascent.ascent_core.domain.user.User;
import com.ascent.ascent_core.domain.user.UserRepository;
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
public class KanbanCardService {

    private final KanbanCardRepository kanbanCardRepository;
    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final UserRepository userRepository;

    public List<KanbanCardResponse> getCards(Long projectId) {
        return kanbanCardRepository.findAllByProjectIdOrderByStatusAscPositionAsc(projectId)
                .stream()
                .map(KanbanCardResponse::new)
                .collect(Collectors.toList());
    }

    @Transactional
    public KanbanCardResponse createCard(Long projectId, Long userId, KanbanCardCreateRequest request) {
        checkMember(projectId, userId);

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new CustomException(ErrorCode.PROJECT_NOT_FOUND));

        User assignee = null;
        if (request.getAssigneeId() != null) {
            assignee = userRepository.findById(request.getAssigneeId())
                    .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
        }

        int position = kanbanCardRepository.countByProjectIdAndStatus(projectId, KanbanStatus.TODO);

        KanbanCard card = KanbanCard.create(
                project, assignee,
                request.getTitle(), request.getDescription(),
                request.getPriority(), request.getDueDate(), position
        );

        kanbanCardRepository.save(card);
        return new KanbanCardResponse(card);
    }

    @Transactional
    public KanbanCardResponse updateCard(Long projectId, Long cardId, Long userId, KanbanCardUpdateRequest request) {
        checkMember(projectId, userId);

        KanbanCard card = kanbanCardRepository.findById(cardId)
                .orElseThrow(() -> new CustomException(ErrorCode.PROJECT_NOT_FOUND));

        User assignee = null;
        if (request.getAssigneeId() != null) {
            assignee = userRepository.findById(request.getAssigneeId())
                    .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
        }

        card.update(request.getTitle(), request.getDescription(),
                request.getPriority(), request.getDueDate(), assignee);

        return new KanbanCardResponse(card);
    }

    @Transactional
    public KanbanCardResponse moveCard(Long projectId, Long cardId, Long userId, KanbanCardMoveRequest request) {
        checkMember(projectId, userId);

        KanbanCard card = kanbanCardRepository.findById(cardId)
                .orElseThrow(() -> new CustomException(ErrorCode.PROJECT_NOT_FOUND));

        int position = request.getPosition() >= 0
                ? request.getPosition()
                : kanbanCardRepository.countByProjectIdAndStatus(projectId, request.getStatus());

        card.moveToStatus(request.getStatus(), position);
        return new KanbanCardResponse(card);
    }

    @Transactional
    public void deleteCard(Long projectId, Long cardId, Long userId) {
        checkMember(projectId, userId);
        kanbanCardRepository.deleteById(cardId);
    }

    private void checkMember(Long projectId, Long userId) {
        projectMemberRepository.findByProjectIdAndUserId(projectId, userId)
                .orElseThrow(() -> new CustomException(ErrorCode.FORBIDDEN));
    }
}
package com.ascent.ascent_core.domain.project;

import com.ascent.ascent_core.chat.ChatRoom;
import com.ascent.ascent_core.chat.ChatRoomMember;
import com.ascent.ascent_core.chat.ChatRoomMemberRole;
import com.ascent.ascent_core.chat.ChatRoomMemberRepository;
import com.ascent.ascent_core.chat.ChatRoomRepository;
import com.ascent.ascent_core.domain.project.dto.InviteCodeResponse;
import com.ascent.ascent_core.domain.project.dto.ProjectCreateRequest;
import com.ascent.ascent_core.domain.project.dto.ProjectMemberResponse;
import com.ascent.ascent_core.domain.project.dto.ProjectResponse;
import com.ascent.ascent_core.domain.project.dto.RoleDescriptionRequest;
import com.ascent.ascent_core.domain.user.User;
import com.ascent.ascent_core.domain.user.UserRepository;
import com.ascent.ascent_core.global.exception.CustomException;
import com.ascent.ascent_core.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final ProjectInviteCodeRepository projectInviteCodeRepository;
    private final UserRepository userRepository;
    private final ChatRoomRepository chatRoomRepository;
    private final ChatRoomMemberRepository chatRoomMemberRepository;

    @Transactional
    public ProjectResponse createProject(Long userId, ProjectCreateRequest request) {
        User owner = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        Project project = Project.create(owner, request.getTitle(), request.getDescription());
        projectRepository.save(project);

        ProjectMember pm = ProjectMember.create(project, owner, ProjectMemberRole.OWNER);
        projectMemberRepository.save(pm);

        ChatRoom room = ChatRoom.create(project);
        chatRoomRepository.save(room);

        ChatRoomMember crm = ChatRoomMember.create(room, owner, ChatRoomMemberRole.OWNER);
        chatRoomMemberRepository.save(crm);

        return new ProjectResponse(project);
    }

    public Page<ProjectResponse> getProjects(Long userId, Pageable pageable) {
        return projectRepository.findAllByMemberUserId(userId, pageable).map(ProjectResponse::new);
    }

    public ProjectResponse getProject(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new CustomException(ErrorCode.PROJECT_NOT_FOUND));
        return new ProjectResponse(project);
    }

    // 프로젝트 멤버 목록 조회
    public List<ProjectMemberResponse> getProjectMembers(Long projectId) {
        return projectMemberRepository.findAllByProjectId(projectId)
                .stream()
                .map(ProjectMemberResponse::new)
                .collect(Collectors.toList());
    }

    // 역할 설명 수정 (OWNER만 가능)
    @Transactional
    public ProjectMemberResponse updateRoleDescription(Long projectId, Long targetUserId, Long requesterId, RoleDescriptionRequest request) {
        // 요청자가 OWNER인지 확인
        ProjectMember requester = projectMemberRepository.findByProjectIdAndUserId(projectId, requesterId)
                .orElseThrow(() -> new CustomException(ErrorCode.FORBIDDEN));
        if (requester.getRole() != ProjectMemberRole.OWNER) {
            throw new CustomException(ErrorCode.FORBIDDEN);
        }

        // 대상 멤버 역할 수정
        ProjectMember target = projectMemberRepository.findByProjectIdAndUserId(projectId, targetUserId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
        target.updateRoleDescription(request.getRoleDescription());

        return new ProjectMemberResponse(target);
    }

    @Transactional
    public InviteCodeResponse createInviteCode(Long projectId, Long userId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new CustomException(ErrorCode.PROJECT_NOT_FOUND));

        ProjectMember member = projectMemberRepository.findByProjectIdAndUserId(projectId, userId)
                .orElseThrow(() -> new CustomException(ErrorCode.FORBIDDEN));
        if (member.getRole() != ProjectMemberRole.OWNER) {
            throw new CustomException(ErrorCode.FORBIDDEN);
        }

        ProjectInviteCode inviteCode = ProjectInviteCode.create(project);
        projectInviteCodeRepository.save(inviteCode);

        return new InviteCodeResponse(inviteCode);
    }

    @Transactional
    public ProjectResponse joinByInviteCode(String code, Long userId) {
        ProjectInviteCode inviteCode = projectInviteCodeRepository.findByCode(code)
                .orElseThrow(() -> new CustomException(ErrorCode.INVITE_CODE_NOT_FOUND));

        if (!inviteCode.isActive() || inviteCode.isExpired()) {
            throw new CustomException(ErrorCode.INVITE_CODE_EXPIRED);
        }

        Project project = inviteCode.getProject();

        if (projectMemberRepository.findByProjectIdAndUserId(project.getId(), userId).isPresent()) {
            throw new CustomException(ErrorCode.ALREADY_PROJECT_MEMBER);
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        ProjectMember newMember = ProjectMember.create(project, user, ProjectMemberRole.MEMBER);
        projectMemberRepository.save(newMember);

        ChatRoom room = chatRoomRepository.findByProjectId(project.getId())
                .orElseThrow(() -> new CustomException(ErrorCode.CHAT_ROOM_NOT_FOUND));
        ChatRoomMember chatMember = ChatRoomMember.create(room, user, ChatRoomMemberRole.MEMBER);
        chatRoomMemberRepository.save(chatMember);

        return new ProjectResponse(project);
    }
}
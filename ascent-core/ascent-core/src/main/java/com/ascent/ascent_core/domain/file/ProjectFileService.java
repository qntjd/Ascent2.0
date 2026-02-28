package com.ascent.ascent_core.domain.file;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.ascent.ascent_core.domain.file.dto.ProjectFileResponse;
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
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProjectFileService {

    private final ProjectFileRepository projectFileRepository;
    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final UserRepository userRepository;
    private final Cloudinary cloudinary;

    // 파일 목록 조회
    public List<ProjectFileResponse> getFiles(Long projectId) {
        return projectFileRepository.findAllByProjectIdOrderByCreatedAtDesc(projectId)
                .stream()
                .map(ProjectFileResponse::new)
                .collect(Collectors.toList());
    }

    // 파일 업로드
    @Transactional
    public ProjectFileResponse uploadFile(Long projectId, Long userId, MultipartFile file) {
        // 멤버 확인
        projectMemberRepository.findByProjectIdAndUserId(projectId, userId)
                .orElseThrow(() -> new CustomException(ErrorCode.FORBIDDEN));

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new CustomException(ErrorCode.PROJECT_NOT_FOUND));

        User uploader = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        try {
            // Cloudinary 업로드
            @SuppressWarnings("unchecked")
            Map<String, Object> uploadResult = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap(
                            "folder", "ascent/" + projectId,
                            "resource_type", "auto"
                    )
            );

            String url = (String) uploadResult.get("secure_url");
            String publicId = (String) uploadResult.get("public_id");
            String fileType = file.getContentType() != null ? file.getContentType() : "application/octet-stream";

            ProjectFile projectFile = ProjectFile.create(
                    project, uploader,
                    file.getOriginalFilename(),
                    url, publicId, fileType, file.getSize()
            );

            projectFileRepository.save(projectFile);
            return new ProjectFileResponse(projectFile);

        } catch (IOException e) {
            throw new RuntimeException("파일 업로드 실패", e);
        }
    }

    // 파일 삭제
    @Transactional
    public void deleteFile(Long projectId, Long fileId, Long userId) {
        projectMemberRepository.findByProjectIdAndUserId(projectId, userId)
                .orElseThrow(() -> new CustomException(ErrorCode.FORBIDDEN));

        ProjectFile file = projectFileRepository.findById(fileId)
                .orElseThrow(() -> new CustomException(ErrorCode.PROJECT_NOT_FOUND));

        try {
            cloudinary.uploader().destroy(file.getPublicId(), ObjectUtils.asMap("resource_type", "auto"));
        } catch (IOException e) {
            // Cloudinary 삭제 실패해도 DB에서는 삭제
        }

        projectFileRepository.delete(file);
    }
}
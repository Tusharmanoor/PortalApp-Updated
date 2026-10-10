package com.jobPortal.portalApp.Service;

import com.jobPortal.portalApp.Model.Resume;
import com.jobPortal.portalApp.Model.User;
import com.jobPortal.portalApp.Repository.ResumeRepository;
import com.jobPortal.portalApp.Repository.UserRepository;
import com.jobPortal.portalApp.dto.ResumeResponseDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ResumeService {

    private final ResumeRepository resumeRepository;
    private final UserRepository userRepository;
    private final RestClient restClient;

    public ResumeResponseDto uploadResume(
            MultipartFile file,
            String jobdescription
    ) throws IOException {

        MultiValueMap<String, Object> body =
                new LinkedMultiValueMap<>();

        body.add("resume", file.getResource());
        body.add("job_description", jobdescription);

        String AIresult = restClient.post()
                .uri("/analyze")
                .contentType(MediaType.MULTIPART_FORM_DATA)
                .body(body)
                .retrieve()
                .body(String.class);


        // ---------- Existing resume saving ----------

        String uploadDir = "uploads";

        File dir = new File(uploadDir);

        if (!dir.exists()) {
            dir.mkdirs();
        }

        String fileName =
                System.currentTimeMillis() + "_" +
                        file.getOriginalFilename();

        String filePath =
                uploadDir + File.separator + fileName;

        File destination = new File(filePath);

        file.transferTo(destination.toPath());


        // ---------- Get logged-in user ----------

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));


        // ---------- Save resume ----------

        Resume resume =
                resumeRepository.findByUser(user)
                        .orElse(new Resume());

        resume.setFilename(file.getOriginalFilename());
        resume.setFilepath(filePath);
        resume.setUploadedAt(LocalDateTime.now());
        resume.setUser(user);

        Resume savedResume =
                resumeRepository.save(resume);


        // ---------- Create response ----------

        ResumeResponseDto response =
                new ResumeResponseDto();

        response.setId(savedResume.getId());
        response.setFilename(savedResume.getFilename());
        response.setUploadedAt(savedResume.getUploadedAt());

        response.setAIResult(AIresult);

        return response;
    }


    public ResumeResponseDto getMyResume() {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        Resume resume =
                resumeRepository.findByUser(user)
                        .orElse(null);

        if (resume == null) {
            return null;
        }

        ResumeResponseDto response =
                new ResumeResponseDto();

        response.setId(resume.getId());
        response.setFilename(resume.getFilename());
        response.setUploadedAt(resume.getUploadedAt());

        return response;
    }
}


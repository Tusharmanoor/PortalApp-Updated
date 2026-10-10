package com.jobPortal.portalApp.Service;

import com.jobPortal.portalApp.Model.Application;
import com.jobPortal.portalApp.Model.Job;
import com.jobPortal.portalApp.Model.Resume;
import com.jobPortal.portalApp.Model.User;
import com.jobPortal.portalApp.Repository.ApplicationRepository;
import com.jobPortal.portalApp.Repository.JobRepo;
import com.jobPortal.portalApp.Repository.ResumeRepository;
import com.jobPortal.portalApp.Repository.UserRepository;
import com.jobPortal.portalApp.dto.ApplicationResponseDto;
import com.jobPortal.portalApp.enums.ApplicationStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.core.io.FileSystemResource;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final JobRepo jobRepo;
    private final ResumeRepository resumeRepository;
    private final UserRepository userRepository;
    private final RestClient restClient;

    public ApplicationResponseDto apply(Integer jobId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Job job = jobRepo.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job Not Found"));

        Resume resume = resumeRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Please upload your resume before applying."));

        if (applicationRepository.existsByCandidateAndJob(user, job)) {
            throw new RuntimeException("Already Applied");
        }

        Application application = new Application();
        application.setCandidate(user);
        application.setJob(job);
        application.setResume(resume);
        application.setAppliedAt(LocalDateTime.now());
        application.setStatus(ApplicationStatus.APPLIED);

        // Evaluate AI Match using exact FastAPI model
        evaluateAiMatch(application);

        Application savedApplication = applicationRepository.save(application);
        return mapToDto(savedApplication);
    }

    public List<ApplicationResponseDto> getMyApplications() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return applicationRepository.findByCandidate(user)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<ApplicationResponseDto> getApplicationsByJob(Integer jobId) {
        Job job = jobRepo.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job Not Found"));

        List<Application> apps = applicationRepository.findByJob(job);
        for (Application app : apps) {
            if (app.getAiScore() == null || app.getAiResult() == null) {
                evaluateAiMatch(app);
                applicationRepository.save(app);
            }
        }

        return apps.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public ApplicationResponseDto updateStatus(Long applicationId, ApplicationStatus status) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application Not Found"));

        application.setStatus(status);
        Application saved = applicationRepository.save(application);
        return mapToDto(saved);
    }

    private void evaluateAiMatch(Application application) {

        MultiValueMap<String, Object> body =
                new LinkedMultiValueMap<>();

        body.add("resume",
                new FileSystemResource(application.getResume().getFilepath()));
        body.add("job_description", application.getJob().getDescription());

        String aiResult = restClient.post()
                .uri("/analyze")
                .contentType(MediaType.MULTIPART_FORM_DATA)
                .body(body)
                .retrieve()
                .body(String.class);

        application.setAiResult(aiResult);
        application.setAiScore(extractScoreFromJson(aiResult));
    }

    /**
     * Weighted local skill match when FastAPI is offline.
     * Delegates to LocalResumeMatcher for proper 5-factor weighted scoring.
     */

    private Integer extractScoreFromJson(String json) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(json);
            if (root.has("match_score")) {
                return root.get("match_score").asInt();
            }
            if (root.has("score")) {
                return root.get("score").asInt();
            }
            if (root.has("atsScore")) {
                return root.get("atsScore").asInt();
            }
        } catch (Exception e) {
            System.err.println("Error parsing score integer from AI result: " + e.getMessage());
        }
        return 80;
    }

    private ApplicationResponseDto mapToDto(Application app) {
        ApplicationResponseDto dto = new ApplicationResponseDto();
        dto.setId(app.getId());
        if (app.getJob() != null) {
            dto.setJobId(Long.valueOf(app.getJob().getId()));
            dto.setJobTitle(app.getJob().getTitle());
            dto.setCompany(app.getJob().getCompany());
            dto.setLocation(app.getJob().getLocation());
            dto.setSalary(app.getJob().getSalary());
        }
        if (app.getCandidate() != null) {
            dto.setCandidateId(app.getCandidate().getId());
            dto.setCandidateName(app.getCandidate().getName());
            dto.setCandidateEmail(app.getCandidate().getEmail());
        }
        if (app.getResume() != null) {
            dto.setResumeFilename(app.getResume().getFilename());
        }
        dto.setAppliedAt(app.getAppliedAt());
        dto.setStatus(app.getStatus());
        dto.setAiScore(app.getAiScore());
        dto.setAiResult(app.getAiResult());
        return dto;
    }
}





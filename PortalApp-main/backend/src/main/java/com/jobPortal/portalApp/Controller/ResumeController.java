package com.jobPortal.portalApp.Controller;

import com.jobPortal.portalApp.Model.Resume;
import com.jobPortal.portalApp.Service.ResumeService;
import com.jobPortal.portalApp.dto.ResumeResponseDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;


@RestController
@RequiredArgsConstructor
@RequestMapping("/resume")
public class ResumeController {
    private final ResumeService resumeService;

    @PostMapping("/upload")
    public ResponseEntity<ResumeResponseDto> UploadResume(
            @RequestParam("file") MultipartFile file, @RequestParam("jobdescription") String jobdescription) throws IOException {
        ResumeResponseDto response = resumeService.uploadResume(file,jobdescription);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/my")
    public ResponseEntity<ResumeResponseDto> getMyResume() {
        ResumeResponseDto resume = resumeService.getMyResume();
        if (resume == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(resume);
    }
}

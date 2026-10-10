package com.jobPortal.portalApp.Controller;
import com.jobPortal.portalApp.Service.ApplicationService;
import com.jobPortal.portalApp.dto.ApplicationResponseDto;
import lombok.RequiredArgsConstructor;
import com.jobPortal.portalApp.enums.ApplicationStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/applications")
public class ApplicationController {
    private final ApplicationService applicationService;

    @PostMapping("/apply")
    public ResponseEntity<ApplicationResponseDto> apply(@RequestParam Integer jobId) {
        ApplicationResponseDto app = applicationService.apply(jobId);
        return ResponseEntity.ok(app);
    }

    @GetMapping("/my")
    public ResponseEntity<List<ApplicationResponseDto>> getMyApplications() {
        return ResponseEntity.ok(applicationService.getMyApplications());
    }

    @GetMapping("/job/{jobId}")
    public ResponseEntity<List<ApplicationResponseDto>> getApplicationsByJob(@PathVariable Integer jobId) {
        return ResponseEntity.ok(applicationService.getApplicationsByJob(jobId));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ApplicationResponseDto> updateStatus(
            @PathVariable Long id,
            @RequestParam ApplicationStatus status) {
        return ResponseEntity.ok(applicationService.updateStatus(id, status));
    }
}

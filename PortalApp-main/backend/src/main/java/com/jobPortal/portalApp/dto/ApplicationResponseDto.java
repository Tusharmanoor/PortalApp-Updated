package com.jobPortal.portalApp.dto;

import com.jobPortal.portalApp.enums.ApplicationStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ApplicationResponseDto {

    private Long id;
    private Long jobId;
    private String jobTitle;
    private String company;
    private String location;
    private BigDecimal salary;
    private Long candidateId;
    private String candidateName;
    private String candidateEmail;
    private String resumeFilename;
    private LocalDateTime appliedAt;
    private ApplicationStatus status;
    private Integer aiScore;
    private String aiResult;
}

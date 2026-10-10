package com.jobPortal.portalApp.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ResumeResponseDto {
    private Long id;
    private String filename;
    private LocalDateTime uploadedAt;
    private String AIResult;

}


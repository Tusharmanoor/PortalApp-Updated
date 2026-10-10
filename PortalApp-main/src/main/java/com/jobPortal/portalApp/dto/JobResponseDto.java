package com.jobPortal.portalApp.dto;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class JobResponseDto {
        private Integer id;
        private String title;
        private String description;
        private String company;
        private String location;
        private BigDecimal salary;
        private Integer experience;
        private String jobType;
        private String skills;
        private Boolean status;
        private LocalDate postedDate;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }

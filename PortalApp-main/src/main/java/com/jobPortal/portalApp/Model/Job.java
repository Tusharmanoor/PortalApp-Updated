package com.jobPortal.portalApp.Model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Date;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
public class Job
{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    @NotBlank(message = "Title cannot be blank")
    @Size(min = 2,max=50,message = "Job title must be between 2 and 50 characters")
    private String title;
    @NotBlank(message = "Job Description cannot be blank")
    @Size(min = 10, max = 1000, message = "Job description must be between 10 and 1000 characters")
    private String description;
    @NotBlank(message = "Company name cannot be blank")
    @Size(min = 2,max = 50,message = "Company name must be between 2 and 50 characters")
    private String company;
    @NotBlank(message = "Location cannot be blank")
    @Size(min = 2,max = 50,message = "Location must be between 2 and 50 characters")
    private String location;
    @NotNull(message="Salary is required")
    @DecimalMin(value ="0.0", inclusive = false,message = "Salary must be greater than 0")
    private BigDecimal salary;
    @NotNull(message = "Experience is Required")
    @Min(value=0, message = "Experience cannot be negative")
    @Max(value = 50,message="Experience cannot exceed 50 years")
    private Integer experience;
    @NotBlank(message = "Job type cannot be blank")
    @Pattern(
            regexp = "^(Full-Time|Part-Time|Internship|Contract|Remote)$",
            message = "Job type must be Full-Time, Part-Time, Internship, Contract or Remote"
    )
    private String jobType;
    @NotBlank(message = "Skills cannot be blank")
    @Size(min = 2,max=500,message = "Skills must be between 2 and 500 characters")
    private String skills;
    @NotNull(message="Status canot be null")
    private Boolean status;
    @NotNull(message = "Posted date cannot be blank")
    private LocalDate postedDate;

    @CreationTimestamp
    private LocalDateTime createdAt;
    @UpdateTimestamp
    private LocalDateTime updatedAt;


}

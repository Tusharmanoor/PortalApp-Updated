package com.jobPortal.portalApp.Model;

import com.jobPortal.portalApp.enums.ApplicationStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Application {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;
    @ManyToOne
    private User candidate;
    @ManyToOne
    private Job job;
    @ManyToOne
    private Resume resume;
    private LocalDateTime appliedAt;
    @Enumerated(EnumType.STRING)
    private ApplicationStatus status;

    private Integer aiScore;

    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String aiResult;
}

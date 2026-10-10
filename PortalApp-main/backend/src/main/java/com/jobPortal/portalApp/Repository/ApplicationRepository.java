package com.jobPortal.portalApp.Repository;

import com.jobPortal.portalApp.Model.Application;
import com.jobPortal.portalApp.Model.Job;
import com.jobPortal.portalApp.Model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ApplicationRepository
        extends JpaRepository<Application, Long> {

    boolean existsByCandidateAndJob(User candidate, Job job);
    List<Application> findByCandidate(User candidate);
    List<Application> findByJob(Job job);
}

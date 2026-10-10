package com.jobPortal.portalApp.Repository;

import com.jobPortal.portalApp.Model.Resume;
import com.jobPortal.portalApp.Model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ResumeRepository  extends  JpaRepository<Resume, Long> {

     Optional <Resume>findByUser(User user);
    }


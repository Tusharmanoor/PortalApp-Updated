package com.jobPortal.portalApp.Controller;


import com.jobPortal.portalApp.Model.Job;
import com.jobPortal.portalApp.Service.JobService;
import com.jobPortal.portalApp.dto.JobRequestDto;
import com.jobPortal.portalApp.dto.JobResponseDto;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/")
public class JobController {
    @Autowired
    private JobService service;

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/jobs")
    public ResponseEntity<List<JobResponseDto>>getAllJobs()
    {
        return new ResponseEntity<>(service.getAllJobs(), HttpStatus.OK);

    }
    @GetMapping("/job/{id}")
    public ResponseEntity<JobResponseDto> getJobById(@PathVariable int id) {
        System.out.println("Printing inside Controller");
        return ResponseEntity.ok(service.getJobById(id));
    }


    @PreAuthorize("hasAnyRole('ADMIN', 'RECRUITER')")
    @PostMapping("/job")
    public ResponseEntity<JobResponseDto> addJob(@Valid @RequestBody JobRequestDto reqDto)
    {
        JobResponseDto addedJob= service.addJob(reqDto);
        return new ResponseEntity<>(addedJob, HttpStatus.CREATED);
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'RECRUITER')")
    @PutMapping("/job/{id}")
    public ResponseEntity<JobResponseDto> updateJob(@PathVariable int id, @Valid @RequestBody JobRequestDto reqDto)
    {
        JobResponseDto UpdatedJob= service.updateJob(id,reqDto);
        return  ResponseEntity.ok(UpdatedJob);

    }
    @PreAuthorize("hasAnyRole('ADMIN', 'RECRUITER')")
    @DeleteMapping("job/{id}")
    public ResponseEntity<?> deleteJobById(@PathVariable int id)
    {
        JobResponseDto job=service.getJobById(id);
        if(job!=null)
        {
            service.deleteJob(id);
            return new ResponseEntity<>("Deleted Successfully", HttpStatus.OK);
        }
        return new ResponseEntity<>("NOT FOUND", HttpStatus.NOT_FOUND);


    }

    @GetMapping("/jobs/search")
    public ResponseEntity<List<JobResponseDto>> searchJobs(@RequestParam String keyword) {
        List<JobResponseDto> jobs = service.searchJob(keyword);
        return new ResponseEntity<>(jobs, HttpStatus.OK);
    }






}

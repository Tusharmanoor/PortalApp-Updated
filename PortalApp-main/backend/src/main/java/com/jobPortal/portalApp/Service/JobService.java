package com.jobPortal.portalApp.Service;

import com.jobPortal.portalApp.Model.Job;
import com.jobPortal.portalApp.Repository.JobRepo;
import com.jobPortal.portalApp.dto.JobRequestDto;
import com.jobPortal.portalApp.dto.JobResponseDto;
import com.jobPortal.portalApp.exception.JobNotFoundException;
import org.hibernate.sql.Update;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class JobService {


    @Autowired
    private JobRepo repo;

    public List<JobResponseDto> getAllJobs()

    {
        List <Job> jobs=repo.findAll();
        List<JobResponseDto> newlist= new ArrayList<>();

                for(Job job:jobs)
                {
                    newlist.add(mapToDto(job));
                }
                return newlist;

    }

    public JobResponseDto getJobById(int id) {
        Job job = repo.findById(id)
                .orElseThrow(() -> new JobNotFoundException("Job with id" + id + "not found"));
        return mapToDto(job);
    }

    public JobResponseDto addJob(JobRequestDto reqDto)
    {
        Job newjob= mapToEntity(reqDto);
        Job savedJob=repo.save(newjob);
        return mapToDto(savedJob);
    }



        public JobResponseDto updateJob(int id, JobRequestDto reqDto) {

            Job existingJob = repo.findById(id)
                    .orElseThrow(() -> new JobNotFoundException("Job not found with id: " + id));

            existingJob.setTitle(reqDto.getTitle());
            existingJob.setDescription(reqDto.getDescription());
            existingJob.setCompany(reqDto.getCompany());
            existingJob.setLocation(reqDto.getLocation());
            existingJob.setSalary(reqDto.getSalary());
            existingJob.setExperience(reqDto.getExperience());
            existingJob.setJobType(reqDto.getJobType());
            existingJob.setSkills(reqDto.getSkills());
            existingJob.setStatus(reqDto.getStatus());
            existingJob.setPostedDate(reqDto.getPostedDate());

            Job savedJob = repo.save(existingJob);

            return mapToDto(savedJob);
        }



    public void deleteJob(int id) {
        repo.deleteById(id);

    }

    public List<JobResponseDto> searchJob(String keyword) {

        List<Job> jobs = repo.searchJob(keyword);

        List<JobResponseDto> responseList = new ArrayList<>();

        for (Job job : jobs) {
            responseList.add(mapToDto(job));
        }

        return responseList;
    }

    private Job mapToEntity(JobRequestDto dto) {
        Job job = new Job();

        job.setTitle(dto.getTitle());
        job.setDescription(dto.getDescription());
        job.setCompany(dto.getCompany());
        job.setLocation(dto.getLocation());
        job.setSalary(dto.getSalary());
        job.setExperience(dto.getExperience());
        job.setJobType(dto.getJobType());
        job.setSkills(dto.getSkills());
        job.setStatus(dto.getStatus());
        job.setPostedDate(dto.getPostedDate());
        return job;
    }

    private JobResponseDto mapToDto(Job job) {
        JobResponseDto dto =new JobResponseDto();
        dto.setId(job.getId());
        dto.setTitle(job.getTitle());
        dto.setDescription(job.getDescription());
        dto.setCompany(job.getCompany());
        dto.setLocation(job.getLocation());
        dto.setSalary(job.getSalary());
        dto.setExperience(job.getExperience());
        dto.setJobType(job.getJobType());
        dto.setSkills(job.getSkills());
        dto.setStatus(job.getStatus());
        dto.setPostedDate(job.getPostedDate());
        dto.setCreatedAt(job.getCreatedAt());
        dto.setUpdatedAt(job.getUpdatedAt());
        return dto;
    }

}

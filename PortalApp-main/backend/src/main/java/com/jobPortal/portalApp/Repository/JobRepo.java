package com.jobPortal.portalApp.Repository;

import com.jobPortal.portalApp.Model.Job;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JobRepo extends JpaRepository <Job, Integer> {


    @Query
            (
                  "  SELECT j FROM Job j WHERE " + "LOWER(j.title) LIKE LOWER(CONCAT('%',:keyword,'%')) OR " +

                    "LOWER(j.company) LIKE LOWER(CONCAT('%',:keyword,'%'))"
            )


     List<Job> searchJob(@Param("keyword") String keyword);
}

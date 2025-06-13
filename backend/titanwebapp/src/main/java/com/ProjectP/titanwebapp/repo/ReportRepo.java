package com.ProjectP.titanwebapp.repo;

import com.ProjectP.titanwebapp.model.Report;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReportRepo extends JpaRepository<Report, Long> {

    // Find reports by creator - Spring Data JPA will automatically implement this
    List<Report> findByCreatedBy(String createdBy);

    // Find reports by creator (case insensitive)
    List<Report> findByCreatedByIgnoreCase(String createdBy);

    // Find reports by application
    List<Report> findByApplication(String application);

    // Find reports by application and creator
    List<Report> findByApplicationAndCreatedBy(String application, String createdBy);

    // Find reports by title containing a keyword
    List<Report> findByTitleContainingIgnoreCase(String keyword);

    // Custom query example - if you need more complex queries
    @Query("SELECT r FROM Report r WHERE r.createdBy = :createdBy ORDER BY r.createdAt DESC")
    List<Report> findReportsByCreatorOrderByDate(@Param("createdBy") String createdBy);
}
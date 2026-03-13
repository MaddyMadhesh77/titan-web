package com.ProjectP.titanwebapp.repo;

import com.ProjectP.titanwebapp.model.ProjectVersion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ProjectVersionRepo extends JpaRepository<ProjectVersion, Long> {
    List<ProjectVersion> findByProjectIdOrderByUploadedAtDesc(Long projectId);
    long countByProjectId(Long projectId);
}

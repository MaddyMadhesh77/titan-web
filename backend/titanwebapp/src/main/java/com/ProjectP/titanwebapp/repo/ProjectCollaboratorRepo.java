package com.ProjectP.titanwebapp.repo;

import com.ProjectP.titanwebapp.model.ProjectCollaborator;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ProjectCollaboratorRepo extends JpaRepository<ProjectCollaborator, Long> {
    List<ProjectCollaborator> findByProjectId(Long projectId);
    List<ProjectCollaborator> findByUsername(String username);
    boolean existsByProjectIdAndUsername(Long projectId, String username);
}

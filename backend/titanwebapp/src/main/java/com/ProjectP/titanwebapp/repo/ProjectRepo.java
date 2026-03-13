package com.ProjectP.titanwebapp.repo;

import com.ProjectP.titanwebapp.model.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ProjectRepo extends JpaRepository<Project, Long> {
    List<Project> findByOwnerUsername(String ownerUsername);
    List<Project> findByVisibility(String visibility);
    List<Project> findByNameContainingIgnoreCase(String keyword);
    List<Project> findByVisibilityOrderByStarsDesc(String visibility);
}

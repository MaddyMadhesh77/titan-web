package com.ProjectP.titanwebapp.repo;

import com.ProjectP.titanwebapp.model.ProjectAnnouncement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ProjectAnnouncementRepo extends JpaRepository<ProjectAnnouncement, Long> {
    List<ProjectAnnouncement> findByProjectIdOrderByCreatedAtDesc(Long projectId);
}

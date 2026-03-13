package com.ProjectP.titanwebapp.controller;

import com.ProjectP.titanwebapp.model.*;
import com.ProjectP.titanwebapp.repo.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.*;

@RestController
@RequestMapping("/api/projects")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000", "http://localhost:5174"},
        allowedHeaders = "*",
        methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT,
                RequestMethod.DELETE, RequestMethod.OPTIONS},
        maxAge = 3600)
public class ProjectController {

    @Autowired private ProjectRepo projectRepo;
    @Autowired private ProjectVersionRepo versionRepo;
    @Autowired private ProjectCollaboratorRepo collaboratorRepo;
    @Autowired private ProjectAnnouncementRepo announcementRepo;

    // ─── Projects ────────────────────────────────────────────────────────────

    @PostMapping
    public ResponseEntity<Project> createProject(@RequestBody Project project) {
        project.setId(null);
        project.setStars(0);
        Project saved = projectRepo.save(project);
        // auto-add owner as collaborator
        ProjectCollaborator ownerCollab = ProjectCollaborator.builder()
                .projectId(saved.getId())
                .username(saved.getOwnerUsername())
                .role("OWNER")
                .build();
        collaboratorRepo.save(ownerCollab);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @GetMapping
    public ResponseEntity<List<Project>> getAllPublicProjects(
            @RequestParam(required = false) String search) {
        List<Project> projects;
        if (search != null && !search.isBlank()) {
            projects = projectRepo.findByNameContainingIgnoreCase(search);
            projects.removeIf(p -> "PRIVATE".equals(p.getVisibility()));
        } else {
            projects = projectRepo.findByVisibilityOrderByStarsDesc("PUBLIC");
        }
        return ResponseEntity.ok(projects);
    }

    @GetMapping("/mine")
    public ResponseEntity<List<Project>> getMyProjects(@RequestParam String owner) {
        return ResponseEntity.ok(projectRepo.findByOwnerUsername(owner));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Project> getProject(@PathVariable Long id) {
        return projectRepo.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Project> updateProject(@PathVariable Long id,
                                                  @RequestBody Project updates) {
        return projectRepo.findById(id).map(p -> {
            if (updates.getName() != null) p.setName(updates.getName());
            if (updates.getDescription() != null) p.setDescription(updates.getDescription());
            if (updates.getVisibility() != null) p.setVisibility(updates.getVisibility());
            return ResponseEntity.ok(projectRepo.save(p));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProject(@PathVariable Long id,
                                               @RequestParam String currentUser) {
        return projectRepo.findById(id).map(p -> {
            if (!p.getOwnerUsername().equals(currentUser)) {
                return ResponseEntity.<Void>status(HttpStatus.FORBIDDEN).build();
            }
            versionRepo.findByProjectIdOrderByUploadedAtDesc(id).forEach(versionRepo::delete);
            collaboratorRepo.findByProjectId(id).forEach(collaboratorRepo::delete);
            announcementRepo.findByProjectIdOrderByCreatedAtDesc(id).forEach(announcementRepo::delete);
            projectRepo.delete(p);
            return ResponseEntity.<Void>ok().build();
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/star")
    public ResponseEntity<Project> toggleStar(@PathVariable Long id) {
        return projectRepo.findById(id).map(p -> {
            p.setStars(p.getStars() + 1);
            return ResponseEntity.ok(projectRepo.save(p));
        }).orElse(ResponseEntity.notFound().build());
    }

    // ─── Versions ─────────────────────────────────────────────────────────────

    @GetMapping("/{id}/versions")
    public ResponseEntity<List<ProjectVersion>> getVersions(@PathVariable Long id) {
        List<ProjectVersion> versions = versionRepo.findByProjectIdOrderByUploadedAtDesc(id);
        // strip binary data for listing (return metadata only)
        versions.forEach(v -> v.setFileData(null));
        return ResponseEntity.ok(versions);
    }

    @PostMapping("/{id}/versions")
    public ResponseEntity<ProjectVersion> uploadVersion(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file,
            @RequestParam("versionLabel") String versionLabel,
            @RequestParam("description") String description,
            @RequestParam("uploadedBy") String uploadedBy) throws IOException {
        if (!projectRepo.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        ProjectVersion version = ProjectVersion.builder()
                .projectId(id)
                .versionLabel(versionLabel)
                .fileTitle(file.getOriginalFilename())
                .fileType(file.getContentType())
                .fileData(file.getBytes())
                .fileSize(file.getSize())
                .description(description)
                .uploadedBy(uploadedBy)
                .build();
        ProjectVersion saved = versionRepo.save(version);
        saved.setFileData(null); // don't return binary
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @GetMapping("/versions/{versionId}/download")
    public ResponseEntity<byte[]> downloadVersion(@PathVariable Long versionId) {
        return versionRepo.findById(versionId).map(v -> {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType(
                    v.getFileType() != null ? v.getFileType() : "application/octet-stream"));
            headers.setContentDispositionFormData("attachment", v.getFileTitle());
            return new ResponseEntity<>(v.getFileData(), headers, HttpStatus.OK);
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/versions/{versionId}/view")
    public ResponseEntity<byte[]> viewVersion(@PathVariable Long versionId) {
        return versionRepo.findById(versionId).map(v -> {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType(
                    v.getFileType() != null ? v.getFileType() : "application/octet-stream"));
            headers.add("Content-Disposition", "inline; filename=\"" + v.getFileTitle() + "\"");
            return new ResponseEntity<>(v.getFileData(), headers, HttpStatus.OK);
        }).orElse(ResponseEntity.notFound().build());
    }

    // ─── Collaborators ────────────────────────────────────────────────────────

    @GetMapping("/{id}/collaborators")
    public ResponseEntity<List<ProjectCollaborator>> getCollaborators(@PathVariable Long id) {
        return ResponseEntity.ok(collaboratorRepo.findByProjectId(id));
    }

    @PostMapping("/{id}/collaborators")
    public ResponseEntity<ProjectCollaborator> addCollaborator(
            @PathVariable Long id,
            @RequestBody ProjectCollaborator collab) {
        if (collaboratorRepo.existsByProjectIdAndUsername(id, collab.getUsername())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }
        collab.setId(null);
        collab.setProjectId(id);
        if (collab.getRole() == null) collab.setRole("VIEWER");
        return ResponseEntity.status(HttpStatus.CREATED).body(collaboratorRepo.save(collab));
    }

    // ─── Announcements ────────────────────────────────────────────────────────

    @GetMapping("/{id}/announcements")
    public ResponseEntity<List<ProjectAnnouncement>> getAnnouncements(@PathVariable Long id) {
        return ResponseEntity.ok(announcementRepo.findByProjectIdOrderByCreatedAtDesc(id));
    }

    @PostMapping("/{id}/announcements")
    public ResponseEntity<ProjectAnnouncement> postAnnouncement(
            @PathVariable Long id,
            @RequestBody ProjectAnnouncement announcement) {
        if (!projectRepo.existsById(id)) return ResponseEntity.notFound().build();
        announcement.setId(null);
        announcement.setProjectId(id);
        return ResponseEntity.status(HttpStatus.CREATED).body(announcementRepo.save(announcement));
    }

    // ─── Stats ────────────────────────────────────────────────────────────────

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats(@RequestParam String username) {
        long myProjects = projectRepo.findByOwnerUsername(username).size();
        long collaborations = collaboratorRepo.findByUsername(username).stream()
                .filter(c -> !c.getRole().equals("OWNER")).count();
        Map<String, Object> stats = new HashMap<>();
        stats.put("myProjects", myProjects);
        stats.put("collaborations", collaborations);
        return ResponseEntity.ok(stats);
    }
}

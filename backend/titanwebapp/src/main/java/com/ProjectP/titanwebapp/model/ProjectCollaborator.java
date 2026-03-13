package com.ProjectP.titanwebapp.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "project_collaborators",
        uniqueConstraints = @UniqueConstraint(columnNames = {"project_id", "username"}))
public class ProjectCollaborator {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "project_id", nullable = false)
    private Long projectId;

    @Column(nullable = false)
    private String username;

    @Column(nullable = false)
    @Builder.Default
    private String role = "VIEWER"; // OWNER, EDITOR, VIEWER

    @Column(name = "added_at")
    private LocalDateTime addedAt;

    @PrePersist
    protected void onCreate() {
        addedAt = LocalDateTime.now();
    }
}

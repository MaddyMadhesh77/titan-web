// ReportService.java - Updated with new repository methods
package com.ProjectP.titanwebapp.service;

import com.ProjectP.titanwebapp.model.Report;
import com.ProjectP.titanwebapp.repo.ReportRepo;
import jakarta.persistence.EntityNotFoundException;
import lombok.extern.log4j.Log4j2;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000", "http://localhost:5174"},
        allowedHeaders = "*",
        methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS},
        maxAge = 3600)
@Log4j2
public class ReportService {

    @Autowired
    private ReportRepo repo;

    public Report uploadFile(MultipartFile file, String app, String desc, String createdBy) throws IOException {
        // Validate and process createdBy
        String processedCreatedBy = processCreatedBy(createdBy);

        Report report = new Report();
        report.setTitle(file.getOriginalFilename());
        report.setDescription(desc);
        report.setApplication(app);
        report.setType(file.getContentType());
        report.setData(file.getBytes());
        report.setFileSize(file.getSize());
        report.setCreatedBy(processedCreatedBy);

        // Set timestamps - though @PrePersist will also handle createdAt
        LocalDateTime now = LocalDateTime.now();
        report.setCreatedAt(now);
        report.setUpdatedAt(now);

        log.info("File uploaded by user: {} with filename: {}", processedCreatedBy, file.getOriginalFilename());
        return repo.save(report);
    }

    public byte[] downloadFile(Long id) {
        return repo.findById(id).map(Report::getData).orElse(null);
    }

    public Report updateFile(Long id, MultipartFile file, String app, String desc) throws IOException {
        Optional<Report> existing = repo.findById(id);
        if (existing.isPresent()) {
            Report report = existing.get();

            // Only update file data if a new file is provided
            if (file != null && !file.isEmpty()) {
                report.setTitle(file.getOriginalFilename());
                report.setType(file.getContentType());
                report.setData(file.getBytes());
                report.setFileSize(file.getSize());
                log.info("File updated by user: {} with new filename: {}", report.getCreatedBy(), file.getOriginalFilename());
            } else {
                log.info("Report metadata updated by user: {} for report ID: {}", report.getCreatedBy(), id);
            }

            // Always update description and application
            report.setDescription(desc);
            report.setApplication(app);

            // updatedAt will be automatically set by @PreUpdate
            return repo.save(report);
        }
        throw new EntityNotFoundException("Report with id " + id + " not found");
    }

    public void deleteFile(Long id) {
        Optional<Report> report = repo.findById(id);
        if (report.isPresent()) {
            log.info("Report deleted: {} by user: {}", report.get().getTitle(), report.get().getCreatedBy());
            repo.deleteById(id);
        } else {
            log.warn("Attempted to delete non-existent report with ID: {}", id);
            throw new EntityNotFoundException("Report with id " + id + " not found");
        }
    }

    public Optional<Report> getMetadata(Long id) {
        return repo.findById(id);
    }

    public List<Report> getAllReports() {
        return repo.findAll();
    }

    // New methods using the repository findBy methods
    public List<Report> getReportsByCreator(String createdBy) {
        return repo.findByCreatedBy(createdBy);
    }

    public List<Report> getReportsByApplication(String application) {
        return repo.findByApplication(application);
    }

    public List<Report> getReportsByCreatorAndApplication(String createdBy, String application) {
        return repo.findByApplicationAndCreatedBy(application, createdBy);
    }

    public List<Report> searchReportsByTitle(String keyword) {
        return repo.findByTitleContainingIgnoreCase(keyword);
    }

    public List<Report> getReportsByCreatorOrderedByDate(String createdBy) {
        String processedCreatedBy = processCreatedBy(createdBy);
        return repo.findReportsByCreatorOrderByDate(processedCreatedBy);
    }

    // Helper method to process and validate createdBy field
    private String processCreatedBy(String createdBy) {
        if (createdBy == null || createdBy.trim().isEmpty()) {
            log.warn("CreatedBy field is null or empty, setting to 'System'");
            return "System";
        }

        String processed = createdBy.trim();

        // If it looks like an email, extract username part
        if (processed.contains("@")) {
            String username = processed.substring(0, processed.indexOf("@"));
            log.info("Extracted username '{}' from email '{}'", username, processed);
            return username;
        }

        // Remove any special characters and limit length
        processed = processed.replaceAll("[^a-zA-Z0-9._-]", "");
        if (processed.length() > 50) {
            processed = processed.substring(0, 50);
            log.info("Truncated createdBy field to 50 characters: {}", processed);
        }

        return processed.isEmpty() ? "Anonymous" : processed;
    }

    // Method to check if user can modify report (owner check)
    public boolean canUserModifyReport(Long reportId, String currentUser) {
        Optional<Report> report = repo.findById(reportId);
        if (report.isPresent()) {
            String reportCreator = report.get().getCreatedBy();
            String processedCurrentUser = processCreatedBy(currentUser);

            // Allow modification if user is the creator or if creator is "System"
            boolean canModify = reportCreator.equals(processedCurrentUser) ||
                    reportCreator.equals("System") ||
                    processedCurrentUser.equals("admin");

            log.info("User '{}' {} modify report '{}' created by '{}'",
                    processedCurrentUser,
                    canModify ? "CAN" : "CANNOT",
                    reportId,
                    reportCreator);

            return canModify;
        }
        return false;
    }

    // Method to get user statistics
    public ReportStats getUserReportStats(String createdBy) {
        String processedCreatedBy = processCreatedBy(createdBy);
        List<Report> userReports = repo.findByCreatedBy(processedCreatedBy);

        long totalFiles = userReports.size();
        long totalSize = userReports.stream()
                .mapToLong(report -> report.getFileSize() != null ? report.getFileSize() : 0L)
                .sum();

        long uniqueApplications = userReports.stream()
                .map(Report::getApplication)
                .distinct()
                .count();

        return new ReportStats(processedCreatedBy, totalFiles, totalSize, uniqueApplications);
    }

    // Inner class for report statistics
    public static class ReportStats {
        private final String createdBy;
        private final long totalReports;
        private final long totalSizeBytes;
        private final long uniqueApplications;

        public ReportStats(String createdBy, long totalReports, long totalSizeBytes, long uniqueApplications) {
            this.createdBy = createdBy;
            this.totalReports = totalReports;
            this.totalSizeBytes = totalSizeBytes;
            this.uniqueApplications = uniqueApplications;
        }

        public String getCreatedBy() { return createdBy; }
        public long getTotalReports() { return totalReports; }
        public long getTotalSizeBytes() { return totalSizeBytes; }
        public long getUniqueApplications() { return uniqueApplications; }

        public String getTotalSizeFormatted() {
            if (totalSizeBytes < 1024) return totalSizeBytes + " B";
            if (totalSizeBytes < 1024 * 1024) return String.format("%.1f KB", totalSizeBytes / 1024.0);
            if (totalSizeBytes < 1024 * 1024 * 1024) return String.format("%.1f MB", totalSizeBytes / (1024.0 * 1024));
            return String.format("%.1f GB", totalSizeBytes / (1024.0 * 1024 * 1024));
        }
    }

    public Optional<Report> getReportById(Long id) {
        return repo.findById(id);
    }

}
package com.ProjectP.titanwebapp.service;

import com.ProjectP.titanwebapp.model.Report;
import com.ProjectP.titanwebapp.repo.ReportRepo;
import jakarta.persistence.EntityNotFoundException;
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
public class ReportService {

    @Autowired
    private ReportRepo repo;

    public Report uploadFile(MultipartFile file, String app, String desc) throws IOException {
        Report report = new Report();
        report.setTitle(file.getOriginalFilename());
        report.setDescription(desc);
        report.setApplication(app);
        report.setType(file.getContentType());
        report.setData(file.getBytes());
        report.setFileSize(file.getSize());

        // Set timestamps - though @PrePersist will also handle createdAt
        LocalDateTime now = LocalDateTime.now();
        report.setCreatedAt(now);
        report.setUpdatedAt(now);

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
        repo.deleteById(id);
    }

    public Optional<Report> getMetadata(Long id) {
        return repo.findById(id);
    }

    public List<Report> getAllReports() {
        return repo.findAll();
    }
}
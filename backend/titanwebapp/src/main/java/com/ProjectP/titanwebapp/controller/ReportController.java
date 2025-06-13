// ReportController.java - Updated with new endpoints
package com.ProjectP.titanwebapp.controller;

import com.ProjectP.titanwebapp.model.Report;
import com.ProjectP.titanwebapp.service.ReportService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000", "http://localhost:5174"},
        allowedHeaders = "*",
        methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS},
        maxAge = 3600)
public class ReportController {

    @Autowired
    private ReportService reportService;

    @PostMapping("/upload")
    public ResponseEntity<Report> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam("app") String app,
            @RequestParam("desc") String desc,
            @RequestParam("createdBy") String createdBy) {
        try {
            Report report = reportService.uploadFile(file, app, desc, createdBy);
            return ResponseEntity.status(HttpStatus.CREATED).body(report);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/update/{id}")
    public ResponseEntity<Report> updateFile(
            @PathVariable Long id,
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestParam("app") String app,
            @RequestParam("desc") String desc,
            @RequestParam(value = "currentUser", required = false) String currentUser) {
        try {
            // Optional: Check if user can modify this report
            if (currentUser != null && !reportService.canUserModifyReport(id, currentUser)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }

            Report report = reportService.updateFile(id, file, app, desc);
            return ResponseEntity.ok(report);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (IllegalArgumentException | IOException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/download/{id}")
    public ResponseEntity<Resource> downloadFile(@PathVariable Long id) {
        byte[] data = reportService.downloadFile(id);
        if (data != null) {
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"report\"")
                    .body(new ByteArrayResource(data));
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deleteFile(@PathVariable Long id,
                                           @RequestParam(value = "currentUser", required = false) String currentUser) {
        try {
            // Optional: Check if user can delete this report
            if (currentUser != null && !reportService.canUserModifyReport(id, currentUser)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }

            reportService.deleteFile(id);
            return ResponseEntity.ok().build();
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/metadata/{id}")
    public ResponseEntity<Optional<Report>> getMetadata(@PathVariable Long id) {
        Optional<Report> report = reportService.getMetadata(id);
        return ResponseEntity.ok(report);
    }

    @GetMapping
    public ResponseEntity<List<Report>> getAllReports() {
        List<Report> reports = reportService.getAllReports();
        return ResponseEntity.ok(reports);
    }

    // New endpoints using findBy methods
    @GetMapping("/creator/{createdBy}")
    public ResponseEntity<List<Report>> getReportsByCreator(@PathVariable String createdBy) {
        List<Report> reports = reportService.getReportsByCreator(createdBy);
        return ResponseEntity.ok(reports);
    }

    @GetMapping("/application/{application}")
    public ResponseEntity<List<Report>> getReportsByApplication(@PathVariable String application) {
        List<Report> reports = reportService.getReportsByApplication(application);
        return ResponseEntity.ok(reports);
    }

    @GetMapping("/creator/{createdBy}/application/{application}")
    public ResponseEntity<List<Report>> getReportsByCreatorAndApplication(
            @PathVariable String createdBy,
            @PathVariable String application) {
        List<Report> reports = reportService.getReportsByCreatorAndApplication(createdBy, application);
        return ResponseEntity.ok(reports);
    }

    @GetMapping("/search")
    public ResponseEntity<List<Report>> searchReportsByTitle(@RequestParam String keyword) {
        List<Report> reports = reportService.searchReportsByTitle(keyword);
        return ResponseEntity.ok(reports);
    }

    @GetMapping("/creator/{createdBy}/ordered")
    public ResponseEntity<List<Report>> getReportsByCreatorOrderedByDate(@PathVariable String createdBy) {
        List<Report> reports = reportService.getReportsByCreatorOrderedByDate(createdBy);
        return ResponseEntity.ok(reports);
    }

    // New endpoint for user statistics
    @GetMapping("/stats/{createdBy}")
    public ResponseEntity<ReportService.ReportStats> getUserStats(@PathVariable String createdBy) {
        ReportService.ReportStats stats = reportService.getUserReportStats(createdBy);
        return ResponseEntity.ok(stats);
    }

    // New endpoint to check if user can modify a report
    @GetMapping("/can-modify/{id}")
    public ResponseEntity<Boolean> canUserModifyReport(@PathVariable Long id,
                                                       @RequestParam String currentUser) {
        boolean canModify = reportService.canUserModifyReport(id, currentUser);
        return ResponseEntity.ok(canModify);
    }

    @GetMapping("/view/{id}")
    public ResponseEntity<Resource> viewFile(@PathVariable Long id) {
        Optional<Report> optionalReport = reportService.getMetadata(id);
        if (optionalReport.isPresent()) {
            Report report = optionalReport.get();
            ByteArrayResource resource = new ByteArrayResource(report.getData());

            MediaType mediaType;
            try {
                mediaType = MediaType.parseMediaType(report.getType());
            } catch (Exception e) {
                mediaType = MediaType.APPLICATION_OCTET_STREAM;
            }

            return ResponseEntity.ok()
                    .contentType(mediaType)
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + report.getTitle() + "\"")
                    .contentLength(report.getFileSize())
                    .body(resource);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

}
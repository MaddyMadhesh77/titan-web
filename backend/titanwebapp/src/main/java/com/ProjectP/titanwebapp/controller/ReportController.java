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

    @PostMapping("/update/{id}")  // Should be POST, not PUT for multipart
    public ResponseEntity<Report> updateFile(
            @PathVariable Long id,
            @RequestParam(value = "file", required = false) MultipartFile file,  // Make optional
            @RequestParam("app") String app,
            @RequestParam("desc") String desc) {
        try {
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
    public ResponseEntity<Void> deleteFile(@PathVariable Long id) {
        reportService.deleteFile(id);
        return ResponseEntity.ok().build();
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

    @PostMapping("/upload")
    public ResponseEntity<Report> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam("app") String app,
            @RequestParam("desc") String desc) {
        try {

            Report report = reportService.uploadFile(file, app, desc); // Make sure this service method exists
            return ResponseEntity.status(HttpStatus.CREATED).body(report);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
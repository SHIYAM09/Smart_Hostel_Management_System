package com.hostel.authz.controller;

import com.hostel.authz.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/files")
@Tag(name = "File Upload Operations", description = "Endpoints for student photo, profile picture, and visitor ID document uploads")
public class FileUploadController {

    @PostMapping(value = "/upload/student-photo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('ADMIN', 'WARDEN', 'STUDENT')")
    @Operation(summary = "Upload Student Photo", description = "Uploads a student passport photograph.")
    public ResponseEntity<ApiResponse<String>> uploadStudentPhoto(@RequestParam("file") MultipartFile file) {
        String filename = "student_photo_" + UUID.randomUUID() + "_" + file.getOriginalFilename();
        return ResponseEntity.ok(ApiResponse.success("Student photo uploaded successfully", "/uploads/" + filename));
    }

    @PostMapping(value = "/upload/profile-photo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('ADMIN', 'WARDEN', 'STUDENT')")
    @Operation(summary = "Upload Profile Photo", description = "Uploads user profile picture.")
    public ResponseEntity<ApiResponse<String>> uploadProfilePhoto(@RequestParam("file") MultipartFile file) {
        String filename = "profile_" + UUID.randomUUID() + "_" + file.getOriginalFilename();
        return ResponseEntity.ok(ApiResponse.success("Profile photo uploaded successfully", "/uploads/" + filename));
    }

    @PostMapping(value = "/upload/complaint-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Upload Complaint Image", description = "Uploads complaint supporting photo.")
    public ResponseEntity<ApiResponse<String>> uploadComplaintImage(@RequestParam("file") MultipartFile file) {
        String filename = "complaint_" + UUID.randomUUID() + "_" + file.getOriginalFilename();
        return ResponseEntity.ok(ApiResponse.success("Complaint image uploaded successfully", "/uploads/" + filename));
    }

    @PostMapping(value = "/upload/visitor-id", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('ADMIN', 'WARDEN')")
    @Operation(summary = "Upload Visitor ID Proof", description = "Uploads scanned ID document for visitors.")
    public ResponseEntity<ApiResponse<String>> uploadVisitorId(@RequestParam("file") MultipartFile file) {
        String filename = "visitor_id_" + UUID.randomUUID() + "_" + file.getOriginalFilename();
        return ResponseEntity.ok(ApiResponse.success("Visitor ID uploaded successfully", "/uploads/" + filename));
    }
}

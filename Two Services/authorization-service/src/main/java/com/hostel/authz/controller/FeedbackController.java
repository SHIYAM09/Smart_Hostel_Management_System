package com.hostel.authz.controller;

import com.hostel.authz.dto.ApiResponse;
import com.hostel.authz.entity.Feedback;
import com.hostel.authz.service.HostelManagementService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/feedback")
@Tag(name = "General Feedback", description = "Endpoints for general hostel feedback and rating submission")
public class FeedbackController {

    private final HostelManagementService hostelService;

    public FeedbackController(HostelManagementService hostelService) {
        this.hostelService = hostelService;
    }

    @PostMapping
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Submit General Feedback", description = "Submits feedback regarding hostel facilities.")
    public ResponseEntity<ApiResponse<Feedback>> createFeedback(@Valid @RequestBody Feedback feedback) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Feedback submitted successfully", hostelService.createFeedback(feedback)));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'WARDEN')")
    @Operation(summary = "Get All Feedback", description = "Retrieves all submitted feedback.")
    public ResponseEntity<ApiResponse<List<Feedback>>> getAllFeedbacks() {
        return ResponseEntity.ok(ApiResponse.success("Feedback list retrieved", hostelService.getAllFeedbacks()));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'WARDEN', 'STUDENT')")
    @Operation(summary = "Get Feedback by ID", description = "Retrieves feedback details by ID.")
    public ResponseEntity<ApiResponse<Feedback>> getFeedbackById(@PathVariable("id") Long id) {
        return ResponseEntity.ok(ApiResponse.success("Feedback retrieved", hostelService.getFeedbackById(id)));
    }

    @GetMapping("/student/{studentId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'WARDEN', 'STUDENT')")
    @Operation(summary = "Get Feedback by Student", description = "Retrieves feedback submitted by a specific student.")
    public ResponseEntity<ApiResponse<List<Feedback>>> getFeedbacksByStudent(@PathVariable("studentId") Long studentId) {
        return ResponseEntity.ok(ApiResponse.success("Student feedback list retrieved", hostelService.getFeedbacksByStudent(studentId)));
    }
}

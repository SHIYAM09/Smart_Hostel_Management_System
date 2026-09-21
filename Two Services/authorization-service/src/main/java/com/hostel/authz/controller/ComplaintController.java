package com.hostel.authz.controller;

import com.hostel.authz.dto.*;
import com.hostel.authz.service.HostelManagementService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/complaints")
@Tag(name = "Complaint Management", description = "Endpoints for student complaint filing and resolution")
public class ComplaintController {

    private final HostelManagementService hostelService;

    public ComplaintController(HostelManagementService hostelService) {
        this.hostelService = hostelService;
    }

    @PostMapping
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Lodge Complaint", description = "Submits a new complaint.")
    public ResponseEntity<ApiResponse<ComplaintDto>> createComplaint(@Valid @RequestBody ComplaintDto dto, Authentication authentication) {
        if (authentication != null) {
            StudentDto currentStudent = hostelService.getStudentByUsername(authentication.getName());
            if (currentStudent != null) {
                dto.setStudentId(currentStudent.getUserId() != null ? currentStudent.getUserId() : currentStudent.getId() != null ? (long) Math.abs(currentStudent.getId().hashCode()) : null);
                dto.setStudentName(currentStudent.getFullName() != null ? currentStudent.getFullName() : authentication.getName());
                if (dto.getRoomNumber() == null || dto.getRoomNumber().isBlank()) {
                    dto.setRoomNumber(currentStudent.getRoomNumber());
                }
            }
        }
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Complaint filed successfully", hostelService.createComplaint(dto)));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'WARDEN')")
    @Operation(summary = "Update Complaint Status", description = "Updates complaint status (IN_PROGRESS, RESOLVED, REJECTED).")
    public ResponseEntity<ApiResponse<ComplaintDto>> updateComplaintStatus(@PathVariable("id") String id, @RequestParam("status") String status) {
        return ResponseEntity.ok(ApiResponse.success("Complaint status updated", hostelService.updateComplaintStatus(id, status)));
    }

    @PostMapping("/{id}/feedback")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Submit Complaint Feedback", description = "Submits rating and feedback for a resolved complaint.")
    public ResponseEntity<ApiResponse<ComplaintDto>> submitComplaintFeedback(
            @PathVariable("id") String id, @RequestParam("rating") Integer rating, @RequestParam(value = "comment", required = false) String comment) {
        return ResponseEntity.ok(ApiResponse.success("Complaint feedback submitted", hostelService.submitComplaintFeedback(id, rating, comment)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'WARDEN', 'STUDENT')")
    @Operation(summary = "Get Complaint by ID", description = "Retrieves complaint details.")
    public ResponseEntity<ApiResponse<ComplaintDto>> getComplaintById(@PathVariable("id") String id, Authentication authentication) {
        ComplaintDto complaint = hostelService.getComplaintById(id);
        if (authentication != null && isStudentOnly(authentication)) {
            StudentDto currentStudent = hostelService.getStudentByUsername(authentication.getName());
            if (currentStudent != null && complaint != null) {
                boolean isOwner = (complaint.getStudentId() != null && currentStudent.getUserId() != null && complaint.getStudentId().equals(currentStudent.getUserId())) ||
                                  (complaint.getStudentName() != null && complaint.getStudentName().equalsIgnoreCase(authentication.getName()));
                if (!isOwner) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN)
                            .body(ApiResponse.error("Access denied: You can only view your own complaints"));
                }
            }
        }
        return ResponseEntity.ok(ApiResponse.success("Complaint details retrieved", complaint));
    }

    @GetMapping("/student/{studentId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'WARDEN', 'STUDENT')")
    @Operation(summary = "Get Complaints by Student ID", description = "Retrieves complaints filed by a student.")
    public ResponseEntity<ApiResponse<List<ComplaintDto>>> getComplaintsByStudent(@PathVariable("studentId") String studentId, Authentication authentication) {
        String targetStudentId = studentId;
        if (authentication != null && isStudentOnly(authentication)) {
            StudentDto currentStudent = hostelService.getStudentByUsername(authentication.getName());
            if (currentStudent != null) {
                return ResponseEntity.ok(ApiResponse.success("Student complaints retrieved", hostelService.getComplaintsByStudent(currentStudent.getUserId())));
            }
        }
        Long numericId = null;
        try { numericId = Long.parseLong(targetStudentId); } catch (Exception ignored) {}
        return ResponseEntity.ok(ApiResponse.success("Student complaints retrieved", hostelService.getComplaintsByStudent(numericId)));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'WARDEN', 'STUDENT')")
    @Operation(summary = "Get All Complaints", description = "Retrieves all complaints across blocks.")
    public ResponseEntity<ApiResponse<List<ComplaintDto>>> getAllComplaints(Authentication authentication) {
        if (authentication != null && isStudentOnly(authentication)) {
            StudentDto currentStudent = hostelService.getStudentByUsername(authentication.getName());
            if (currentStudent != null) {
                return ResponseEntity.ok(ApiResponse.success("Complaints retrieved", hostelService.getComplaintsByStudent(currentStudent.getUserId())));
            }
        }
        return ResponseEntity.ok(ApiResponse.success("All complaints retrieved", hostelService.getAllComplaints()));
    }

    private boolean isStudentOnly(Authentication authentication) {
        return authentication.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_STUDENT")) &&
               authentication.getAuthorities().stream().noneMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_WARDEN"));
    }
}

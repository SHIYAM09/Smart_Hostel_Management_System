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
@RequestMapping({"/api/v1/leave-requests", "/api/v1/leave"})
@Tag(name = "Leave Request Management", description = "Endpoints for student leave applications and approvals")
public class LeaveRequestController {

    private final HostelManagementService hostelService;

    public LeaveRequestController(HostelManagementService hostelService) {
        this.hostelService = hostelService;
    }

    @PostMapping
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Apply for Leave", description = "Submits a new leave request for warden approval.")
    public ResponseEntity<ApiResponse<LeaveRequestDto>> applyLeave(@Valid @RequestBody LeaveRequestDto dto, Authentication authentication) {
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
                .body(ApiResponse.success("Leave application submitted successfully", hostelService.applyLeave(dto)));
    }

    @PutMapping({"/{id}/status", "/status/{id}"})
    @PreAuthorize("hasAnyRole('ADMIN', 'WARDEN')")
    @Operation(summary = "Approve or Reject Leave", description = "Updates leave request status (APPROVED / REJECTED) with remarks.")
    public ResponseEntity<ApiResponse<LeaveRequestDto>> updateLeaveStatus(
            @PathVariable("id") String id, @RequestParam("status") String status, @RequestParam(value = "remarks", required = false) String remarks) {
        return ResponseEntity.ok(ApiResponse.success("Leave status updated", hostelService.updateLeaveStatus(id, status, remarks)));
    }

    @GetMapping("/student/{studentId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'WARDEN', 'STUDENT')")
    @Operation(summary = "Get Leave Requests by Student", description = "Retrieves leave requests for a specific student.")
    public ResponseEntity<ApiResponse<List<LeaveRequestDto>>> getLeaveRequestsByStudent(@PathVariable("studentId") String studentId, Authentication authentication) {
        if (authentication != null && isStudentOnly(authentication)) {
            StudentDto currentStudent = hostelService.getStudentByUsername(authentication.getName());
            if (currentStudent != null) {
                return ResponseEntity.ok(ApiResponse.success("Student leave requests retrieved", hostelService.getLeaveRequestsByStudent(currentStudent.getUserId())));
            }
        }
        Long numericId = null;
        try { numericId = Long.parseLong(studentId); } catch (Exception ignored) {}
        return ResponseEntity.ok(ApiResponse.success("Student leave requests retrieved", hostelService.getLeaveRequestsByStudent(numericId)));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'WARDEN', 'STUDENT')")
    @Operation(summary = "Get All Leave Requests", description = "Retrieves all student leave applications.")
    public ResponseEntity<ApiResponse<List<LeaveRequestDto>>> getAllLeaveRequests(Authentication authentication) {
        if (authentication != null && isStudentOnly(authentication)) {
            StudentDto currentStudent = hostelService.getStudentByUsername(authentication.getName());
            if (currentStudent != null) {
                return ResponseEntity.ok(ApiResponse.success("Leave requests retrieved", hostelService.getLeaveRequestsByStudent(currentStudent.getUserId())));
            }
        }
        return ResponseEntity.ok(ApiResponse.success("All leave requests retrieved", hostelService.getAllLeaveRequests()));
    }

    private boolean isStudentOnly(Authentication authentication) {
        return authentication.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_STUDENT")) &&
               authentication.getAuthorities().stream().noneMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_WARDEN"));
    }
}

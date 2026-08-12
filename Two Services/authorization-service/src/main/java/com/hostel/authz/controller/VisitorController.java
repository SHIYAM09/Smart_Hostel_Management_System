package com.hostel.authz.controller;

import com.hostel.authz.dto.ApiResponse;
import com.hostel.authz.entity.Visitor;
import com.hostel.authz.entity.VisitorLog;
import com.hostel.authz.service.HostelManagementService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/v1/visitors")
@Tag(name = "Visitor Management", description = "Endpoints for registering visitors and tracking gate entry/exit logs")
public class VisitorController {

    private final HostelManagementService hostelService;

    public VisitorController(HostelManagementService hostelService) {
        this.hostelService = hostelService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'WARDEN', 'STUDENT')")
    @Operation(summary = "Register Visitor", description = "Registers a new visitor for a student.")
    public ResponseEntity<ApiResponse<Visitor>> registerVisitor(@Valid @RequestBody Visitor visitor) {
        if (visitor.getInTime() == null) {
            visitor.setInTime(LocalDateTime.now());
        }
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Visitor registered successfully", hostelService.registerVisitor(visitor)));
    }

    @PostMapping("/logs/entry")
    @PreAuthorize("hasAnyRole('ADMIN', 'WARDEN')")
    @Operation(summary = "Log Visitor Gate Entry", description = "Logs visitor gate entry.")
    public ResponseEntity<ApiResponse<VisitorLog>> logVisitorEntry(@Valid @RequestBody VisitorLog visitorLog) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Visitor entry logged", hostelService.logVisitorEntry(visitorLog)));
    }

    @PostMapping("/logs/checkout/{logId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'WARDEN')")
    @Operation(summary = "Check Out Visitor", description = "Logs visitor gate checkout timestamp.")
    public ResponseEntity<ApiResponse<VisitorLog>> checkOutVisitor(@PathVariable("logId") String logId) {
        return ResponseEntity.ok(ApiResponse.success("Visitor checked out", hostelService.checkOutVisitor(logId)));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'WARDEN', 'STUDENT')")
    @Operation(summary = "Get All Visitors", description = "Retrieves all registered visitors.")
    public ResponseEntity<ApiResponse<List<VisitorLog>>> getAllVisitors() {
        return ResponseEntity.ok(ApiResponse.success("Visitors retrieved", hostelService.getVisitorLogs()));
    }

    @GetMapping("/logs")
    @PreAuthorize("hasAnyRole('ADMIN', 'WARDEN', 'STUDENT')")
    @Operation(summary = "Get All Visitor Logs", description = "Retrieves all visitor entry/exit logs.")
    public ResponseEntity<ApiResponse<List<VisitorLog>>> getVisitorLogs() {
        return ResponseEntity.ok(ApiResponse.success("Visitor logs retrieved", hostelService.getVisitorLogs()));
    }

    @GetMapping("/student/{studentId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'WARDEN', 'STUDENT')")
    @Operation(summary = "Get Visitor Logs by Student ID", description = "Retrieves visitor requests for a specific student.")
    public ResponseEntity<ApiResponse<List<VisitorLog>>> getVisitorLogsByStudent(@PathVariable("studentId") String studentId) {
        return ResponseEntity.ok(ApiResponse.success("Student visitor logs retrieved", hostelService.getVisitorLogsByStudent(studentId)));
    }
}

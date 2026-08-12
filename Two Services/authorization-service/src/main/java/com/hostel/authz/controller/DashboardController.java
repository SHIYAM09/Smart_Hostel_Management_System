package com.hostel.authz.controller;

import com.hostel.authz.dto.*;
import com.hostel.authz.service.HostelManagementService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping({"/api/v1/dashboards", "/api/v1/dashboard"})
@Tag(name = "Dashboard Analytics", description = "Endpoints for aggregated metrics for Student, Warden, and Admin dashboards")
public class DashboardController {

    private final HostelManagementService hostelService;

    public DashboardController(HostelManagementService hostelService) {
        this.hostelService = hostelService;
    }

    @GetMapping("/student")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Get Student Dashboard Metrics", description = "Retrieves student summary metrics (pending complaints, leaves).")
    public ResponseEntity<ApiResponse<DashboardMetricsDto>> getStudentDashboard(Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.success("Student dashboard metrics retrieved", hostelService.getStudentDashboard(authentication.getName())));
    }

    @GetMapping("/warden")
    @PreAuthorize("hasRole('WARDEN')")
    @Operation(summary = "Get Warden Dashboard Metrics", description = "Retrieves warden block overview metrics.")
    public ResponseEntity<ApiResponse<DashboardMetricsDto>> getWardenDashboard(Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.success("Warden dashboard metrics retrieved", hostelService.getWardenDashboard(authentication.getName())));
    }

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get Admin Dashboard Metrics", description = "Retrieves system-wide administrative overview metrics.")
    public ResponseEntity<ApiResponse<DashboardMetricsDto>> getAdminDashboard(Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.success("Admin dashboard metrics retrieved", hostelService.getAdminDashboard(authentication.getName())));
    }
}

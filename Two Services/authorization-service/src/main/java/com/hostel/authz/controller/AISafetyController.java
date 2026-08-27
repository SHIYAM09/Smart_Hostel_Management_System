package com.hostel.authz.controller;

import com.hostel.authz.dto.AISafetyAnalyticsDto;
import com.hostel.authz.dto.ApiResponse;
import com.hostel.authz.service.HostelManagementService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping({"/api/v1/ai", "/api/v1/authz/ai"})
@Tag(name = "AI Safety Analytics Controller", description = "Endpoint for consolidated AI Safety Monitor risk assessments")
public class AISafetyController {

    private final HostelManagementService hostelService;

    public AISafetyController(HostelManagementService hostelService) {
        this.hostelService = hostelService;
    }

    @GetMapping("/safety-monitor")
    @Operation(summary = "Get AI Safety Analytics & Risk Assessment")
    public ResponseEntity<ApiResponse<AISafetyAnalyticsDto>> getAISafetyMonitor(Authentication auth) {
        AISafetyAnalyticsDto dto = hostelService.getAISafetyAnalytics(auth);
        return ResponseEntity.ok(ApiResponse.success("AI Safety analytics retrieved", dto));
    }
}

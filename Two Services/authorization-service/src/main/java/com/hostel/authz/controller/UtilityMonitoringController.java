package com.hostel.authz.controller;

import com.hostel.authz.dto.ApiResponse;
import com.hostel.authz.entity.UtilityMonitoring;
import com.hostel.authz.service.HostelManagementService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/utilities")
@Tag(name = "Utility Monitoring", description = "Endpoints for electricity, water, and gas consumption tracking")
public class UtilityMonitoringController {

    private final HostelManagementService hostelService;

    public UtilityMonitoringController(HostelManagementService hostelService) {
        this.hostelService = hostelService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'WARDEN')")
    @Operation(summary = "Record Utility Reading", description = "Logs power/water/gas usage for a block.")
    public ResponseEntity<ApiResponse<UtilityMonitoring>> recordUtility(@Valid @RequestBody UtilityMonitoring utility) {
        if (utility.getReadingDate() == null) {
            utility.setReadingDate(LocalDate.now());
        }
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Utility reading recorded", hostelService.recordUtility(utility)));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'WARDEN')")
    @Operation(summary = "Get All Utility Readings", description = "Retrieves all recorded utility consumption logs.")
    public ResponseEntity<ApiResponse<List<UtilityMonitoring>>> getAllUtilityLogs() {
        return ResponseEntity.ok(ApiResponse.success("Utility logs retrieved", hostelService.getAllUtilityLogs()));
    }
}

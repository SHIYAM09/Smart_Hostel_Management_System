package com.hostel.authz.controller;

import com.hostel.authz.dto.*;
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
@RequestMapping("/api/v1/wardens")
@Tag(name = "Warden Management", description = "Endpoints for warden profiles and block assignments")
public class WardenController {

    private final HostelManagementService hostelService;

    public WardenController(HostelManagementService hostelService) {
        this.hostelService = hostelService;
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create Warden", description = "Creates a new warden record associated with a user account.")
    public ResponseEntity<ApiResponse<WardenDto>> createWarden(@Valid @RequestBody WardenDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Warden created successfully", hostelService.createWarden(dto)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'WARDEN')")
    @Operation(summary = "Update Warden", description = "Updates warden details by ID.")
    public ResponseEntity<ApiResponse<WardenDto>> updateWarden(@PathVariable("id") String id, @RequestBody WardenDto dto) {
        return ResponseEntity.ok(ApiResponse.success("Warden updated successfully", hostelService.updateWarden(id, dto)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete Warden", description = "Deletes a warden record by ID.")
    public ResponseEntity<ApiResponse<Void>> deleteWarden(@PathVariable("id") String id) {
        hostelService.deleteWarden(id);
        return ResponseEntity.ok(ApiResponse.success("Warden deleted successfully"));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'WARDEN')")
    @Operation(summary = "Get Warden by ID", description = "Retrieves warden details by ID.")
    public ResponseEntity<ApiResponse<WardenDto>> getWardenById(@PathVariable("id") String id) {
        return ResponseEntity.ok(ApiResponse.success("Warden details retrieved", hostelService.getWardenById(id)));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get All Wardens", description = "Retrieves a list of all wardens.")
    public ResponseEntity<ApiResponse<List<WardenDto>>> getAllWardens() {
        return ResponseEntity.ok(ApiResponse.success("Wardens retrieved", hostelService.getAllWardens()));
    }
}

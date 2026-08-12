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
@RequestMapping("/api/v1/admins")
@Tag(name = "Admin Management", description = "Endpoints for administrator profile operations")
public class AdminController {

    private final HostelManagementService hostelService;

    public AdminController(HostelManagementService hostelService) {
        this.hostelService = hostelService;
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create Admin", description = "Creates a new admin profile.")
    public ResponseEntity<ApiResponse<AdminDto>> createAdmin(@Valid @RequestBody AdminDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Admin created successfully", hostelService.createAdmin(dto)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get Admin by ID", description = "Retrieves admin details by ID.")
    public ResponseEntity<ApiResponse<AdminDto>> getAdminById(@PathVariable("id") Long id) {
        return ResponseEntity.ok(ApiResponse.success("Admin details retrieved", hostelService.getAdminById(id)));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get All Admins", description = "Retrieves a list of all system administrators.")
    public ResponseEntity<ApiResponse<List<AdminDto>>> getAllAdmins() {
        return ResponseEntity.ok(ApiResponse.success("Admins retrieved", hostelService.getAllAdmins()));
    }
}

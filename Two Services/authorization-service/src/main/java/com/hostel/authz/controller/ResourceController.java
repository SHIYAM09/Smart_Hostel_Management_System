package com.hostel.authz.controller;

import com.hostel.authz.dto.ApiResponse;
import com.hostel.authz.entity.ResourceItem;
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
@RequestMapping("/api/v1/resources")
@Tag(name = "Resource Inventory Management", description = "Endpoints for managing hostel assets and furniture inventory")
public class ResourceController {

    private final HostelManagementService hostelService;

    public ResourceController(HostelManagementService hostelService) {
        this.hostelService = hostelService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'WARDEN')")
    @Operation(summary = "Create Resource", description = "Creates a new resource item in inventory.")
    public ResponseEntity<ApiResponse<ResourceItem>> createResource(@Valid @RequestBody ResourceItem resource) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Resource created successfully", hostelService.createResource(resource)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'WARDEN')")
    @Operation(summary = "Update Resource", description = "Updates inventory quantity or block location by ID.")
    public ResponseEntity<ApiResponse<ResourceItem>> updateResource(@PathVariable("id") Long id, @RequestBody ResourceItem resource) {
        return ResponseEntity.ok(ApiResponse.success("Resource updated successfully", hostelService.updateResource(id, resource)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete Resource", description = "Deletes a resource item by ID.")
    public ResponseEntity<ApiResponse<Void>> deleteResource(@PathVariable("id") Long id) {
        hostelService.deleteResource(id);
        return ResponseEntity.ok(ApiResponse.success("Resource deleted successfully"));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'WARDEN')")
    @Operation(summary = "Get All Resources", description = "Retrieves a list of all inventory items.")
    public ResponseEntity<ApiResponse<List<ResourceItem>>> getAllResources() {
        return ResponseEntity.ok(ApiResponse.success("Resources retrieved", hostelService.getAllResources()));
    }
}

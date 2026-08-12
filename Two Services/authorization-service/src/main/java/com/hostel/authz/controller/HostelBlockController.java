package com.hostel.authz.controller;

import com.hostel.authz.dto.ApiResponse;
import com.hostel.authz.entity.HostelBlock;
import com.hostel.authz.service.HostelManagementService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/hostel-blocks")
@Tag(name = "Hostel Block Management", description = "Endpoints for managing hostel blocks and capacities")
public class HostelBlockController {

    private final HostelManagementService hostelService;

    public HostelBlockController(HostelManagementService hostelService) {
        this.hostelService = hostelService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'WARDEN', 'STUDENT')")
    @Operation(summary = "Get All Hostel Blocks", description = "Retrieves a list of all hostel blocks")
    public ResponseEntity<ApiResponse<List<HostelBlock>>> getAllBlocks() {
        return ResponseEntity.ok(ApiResponse.success("Hostel blocks retrieved", hostelService.getAllHostelBlocks()));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create Hostel Block", description = "Adds a new hostel block to the system")
    public ResponseEntity<ApiResponse<HostelBlock>> createBlock(@RequestBody HostelBlock block) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Hostel block created successfully", hostelService.createHostelBlock(block)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update Hostel Block", description = "Updates details of an existing hostel block")
    public ResponseEntity<ApiResponse<HostelBlock>> updateBlock(@PathVariable("id") String id, @RequestBody HostelBlock block) {
        return ResponseEntity.ok(ApiResponse.success("Hostel block updated successfully", hostelService.updateHostelBlock(id, block)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete Hostel Block", description = "Deletes a hostel block from the system")
    public ResponseEntity<ApiResponse<Void>> deleteBlock(@PathVariable("id") String id) {
        hostelService.deleteHostelBlock(id);
        return ResponseEntity.ok(ApiResponse.success("Hostel block deleted successfully"));
    }
}

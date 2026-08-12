package com.hostel.authz.controller;

import com.hostel.authz.dto.*;
import com.hostel.authz.entity.RoomAllocation;
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
@RequestMapping("/api/v1/rooms")
@Tag(name = "Room & Allocation Management", description = "Endpoints for room management, capacity, and allocations")
public class RoomController {

    private final HostelManagementService hostelService;

    public RoomController(HostelManagementService hostelService) {
        this.hostelService = hostelService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'WARDEN')")
    @Operation(summary = "Create Room", description = "Creates a new room in a hostel block.")
    public ResponseEntity<ApiResponse<RoomDto>> createRoom(@Valid @RequestBody RoomDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Room created successfully", hostelService.createRoom(dto)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'WARDEN')")
    @Operation(summary = "Update Room", description = "Updates room capacity or status by ID.")
    public ResponseEntity<ApiResponse<RoomDto>> updateRoom(@PathVariable("id") Long id, @RequestBody RoomDto dto) {
        return ResponseEntity.ok(ApiResponse.success("Room updated successfully", hostelService.updateRoom(id, dto)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete Room", description = "Deletes a room by ID.")
    public ResponseEntity<ApiResponse<Void>> deleteRoom(@PathVariable("id") Long id) {
        hostelService.deleteRoom(id);
        return ResponseEntity.ok(ApiResponse.success("Room deleted successfully"));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'WARDEN', 'STUDENT')")
    @Operation(summary = "Get Room by ID", description = "Retrieves room details by ID.")
    public ResponseEntity<ApiResponse<RoomDto>> getRoomById(@PathVariable("id") Long id) {
        return ResponseEntity.ok(ApiResponse.success("Room details retrieved", hostelService.getRoomById(id)));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'WARDEN', 'STUDENT')")
    @Operation(summary = "Get All Rooms", description = "Retrieves all rooms.")
    public ResponseEntity<ApiResponse<List<RoomDto>>> getAllRooms() {
        return ResponseEntity.ok(ApiResponse.success("Rooms retrieved", hostelService.getAllRooms()));
    }

    @PostMapping("/allocate")
    @PreAuthorize("hasAnyRole('ADMIN', 'WARDEN')")
    @Operation(summary = "Allocate Room to Student", description = "Assigns a student to a room.")
    public ResponseEntity<ApiResponse<RoomAllocation>> allocateRoom(@RequestParam("studentId") Long studentId, @RequestParam("roomId") Long roomId) {
        return ResponseEntity.ok(ApiResponse.success("Room allocated successfully", hostelService.allocateRoom(studentId, roomId)));
    }

    @PostMapping("/vacate/{allocationId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'WARDEN')")
    @Operation(summary = "Vacate Room", description = "Vacates a room allocation by allocation ID.")
    public ResponseEntity<ApiResponse<Void>> vacateRoom(@PathVariable("allocationId") Long allocationId) {
        hostelService.vacateRoom(allocationId);
        return ResponseEntity.ok(ApiResponse.success("Room vacated successfully"));
    }

    @GetMapping("/allocations")
    @PreAuthorize("hasAnyRole('ADMIN', 'WARDEN')")
    @Operation(summary = "Get All Room Allocations", description = "Retrieves a list of all current room allocations.")
    public ResponseEntity<ApiResponse<List<RoomAllocation>>> getAllAllocations() {
        return ResponseEntity.ok(ApiResponse.success("Allocations retrieved", hostelService.getAllAllocations()));
    }
}

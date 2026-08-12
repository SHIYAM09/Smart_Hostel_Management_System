package com.hostel.authz.controller;

import com.hostel.authz.dto.ApiResponse;
import com.hostel.authz.entity.Notification;
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
@RequestMapping("/api/v1/notifications")
@Tag(name = "Notification Management", description = "Endpoints for sending and reading user notifications")
public class NotificationController {

    private final HostelManagementService hostelService;

    public NotificationController(HostelManagementService hostelService) {
        this.hostelService = hostelService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'WARDEN', 'STUDENT')")
    @Operation(summary = "Create Notification", description = "Creates a new notification for target roles or users.")
    public ResponseEntity<ApiResponse<Notification>> createNotification(@Valid @RequestBody Notification notification) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Notification sent successfully", hostelService.createNotification(notification)));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'WARDEN', 'STUDENT')")
    @Operation(summary = "Get All Notifications", description = "Retrieves all notifications.")
    public ResponseEntity<ApiResponse<List<Notification>>> getAllNotifications() {
        return ResponseEntity.ok(ApiResponse.success("Notifications retrieved", hostelService.getAllNotifications()));
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'WARDEN', 'STUDENT')")
    @Operation(summary = "Get User Notifications", description = "Retrieves all notifications for a specific user ID.")
    public ResponseEntity<ApiResponse<List<Notification>>> getNotificationsForUser(@PathVariable("userId") Long userId) {
        return ResponseEntity.ok(ApiResponse.success("Notifications retrieved", hostelService.getNotificationsForUser(userId)));
    }

    @PutMapping("/{id}/read")
    @PreAuthorize("hasAnyRole('ADMIN', 'WARDEN', 'STUDENT')")
    @Operation(summary = "Mark Notification as Read", description = "Updates notification read status.")
    public ResponseEntity<ApiResponse<Void>> markNotificationAsRead(@PathVariable("id") String id) {
        hostelService.markNotificationAsRead(id);
        return ResponseEntity.ok(ApiResponse.success("Notification marked as read"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'WARDEN', 'STUDENT')")
    @Operation(summary = "Delete Notification", description = "Deletes a notification by ID.")
    public ResponseEntity<ApiResponse<Void>> deleteNotification(@PathVariable("id") String id) {
        hostelService.deleteNotification(id);
        return ResponseEntity.ok(ApiResponse.success("Notification deleted successfully"));
    }

    @DeleteMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'WARDEN', 'STUDENT')")
    @Operation(summary = "Clear All Notifications", description = "Deletes all notifications.")
    public ResponseEntity<ApiResponse<Void>> clearAllNotifications() {
        hostelService.deleteAllNotifications();
        return ResponseEntity.ok(ApiResponse.success("All notifications cleared"));
    }
}

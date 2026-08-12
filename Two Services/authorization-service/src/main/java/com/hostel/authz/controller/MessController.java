package com.hostel.authz.controller;

import com.hostel.authz.dto.ApiResponse;
import com.hostel.authz.entity.FoodWastage;
import com.hostel.authz.entity.MessFeedback;
import com.hostel.authz.entity.MessMenu;
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
@RequestMapping("/api/v1/mess")
@Tag(name = "Mess Management", description = "Endpoints for weekly menu, mess feedback, and food wastage tracking")
public class MessController {

    private final HostelManagementService hostelService;

    public MessController(HostelManagementService hostelService) {
        this.hostelService = hostelService;
    }

    @PostMapping("/menu")
    @PreAuthorize("hasAnyRole('ADMIN', 'WARDEN')")
    @Operation(summary = "Set Mess Menu", description = "Creates or updates mess menu for a day of week.")
    public ResponseEntity<ApiResponse<MessMenu>> createOrUpdateMessMenu(@Valid @RequestBody MessMenu messMenu) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Mess menu updated", hostelService.createOrUpdateMessMenu(messMenu)));
    }

    @GetMapping("/menu/{dayOfWeek}")
    @PreAuthorize("hasAnyRole('ADMIN', 'WARDEN', 'STUDENT')")
    @Operation(summary = "Get Menu by Day", description = "Retrieves mess menu for a specific day.")
    public ResponseEntity<ApiResponse<MessMenu>> getMessMenuByDay(@PathVariable("dayOfWeek") String dayOfWeek) {
        return ResponseEntity.ok(ApiResponse.success("Day menu retrieved", hostelService.getMessMenuByDay(dayOfWeek)));
    }

    @GetMapping("/menu")
    @PreAuthorize("hasAnyRole('ADMIN', 'WARDEN', 'STUDENT')")
    @Operation(summary = "Get Full Mess Menu", description = "Retrieves weekly mess menu.")
    public ResponseEntity<ApiResponse<List<MessMenu>>> getAllMessMenus() {
        return ResponseEntity.ok(ApiResponse.success("Weekly mess menu retrieved", hostelService.getAllMessMenus()));
    }

    @PostMapping("/feedback")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Submit Mess Feedback", description = "Submits feedback for mess meal quality.")
    public ResponseEntity<ApiResponse<MessFeedback>> submitMessFeedback(@Valid @RequestBody MessFeedback feedback) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Mess feedback submitted", hostelService.submitMessFeedback(feedback)));
    }

    @GetMapping("/feedback")
    @PreAuthorize("hasAnyRole('ADMIN', 'WARDEN', 'STUDENT')")
    @Operation(summary = "Get All Mess Feedback", description = "Retrieves all submitted mess feedback.")
    public ResponseEntity<ApiResponse<List<MessFeedback>>> getAllMessFeedback() {
        return ResponseEntity.ok(ApiResponse.success("Mess feedback list retrieved", hostelService.getAllMessFeedback()));
    }

    @PostMapping("/food-wastage")
    @PreAuthorize("hasAnyRole('ADMIN', 'WARDEN')")
    @Operation(summary = "Record Food Wastage", description = "Logs daily mess food wastage in kilograms.")
    public ResponseEntity<ApiResponse<FoodWastage>> recordFoodWastage(@Valid @RequestBody FoodWastage wastage) {
        if (wastage.getLogDate() == null) {
            wastage.setLogDate(LocalDate.now());
        }
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Food wastage recorded", hostelService.recordFoodWastage(wastage)));
    }

    @GetMapping("/food-wastage")
    @PreAuthorize("hasAnyRole('ADMIN', 'WARDEN', 'STUDENT')")
    @Operation(summary = "Get Food Wastage Logs", description = "Retrieves history of recorded food wastage.")
    public ResponseEntity<ApiResponse<List<FoodWastage>>> getFoodWastageLogs() {
        return ResponseEntity.ok(ApiResponse.success("Food wastage logs retrieved", hostelService.getFoodWastageLogs()));
    }
}

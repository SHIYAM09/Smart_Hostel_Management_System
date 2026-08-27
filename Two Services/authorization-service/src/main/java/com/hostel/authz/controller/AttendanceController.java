package com.hostel.authz.controller;

import com.hostel.authz.dto.*;
import com.hostel.authz.service.HostelManagementService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/attendance")
@Tag(name = "Attendance Management", description = "Endpoints for student daily attendance tracking")
public class AttendanceController {

    private final HostelManagementService hostelService;

    public AttendanceController(HostelManagementService hostelService) {
        this.hostelService = hostelService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'WARDEN')")
    @Operation(summary = "Mark Single Student Attendance", description = "Marks attendance for a student.")
    public ResponseEntity<ApiResponse<AttendanceDto>> markAttendance(@Valid @RequestBody AttendanceDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Attendance marked successfully", hostelService.markAttendance(dto)));
    }

    @PostMapping("/bulk")
    @PreAuthorize("hasAnyRole('ADMIN', 'WARDEN')")
    @Operation(summary = "Mark Bulk Attendance", description = "Marks attendance for multiple students in batch.")
    public ResponseEntity<ApiResponse<List<AttendanceDto>>> markBulkAttendance(@RequestBody List<AttendanceDto> dtoList) {
        return ResponseEntity.ok(ApiResponse.success("Bulk attendance marked successfully", hostelService.markBulkAttendance(dtoList)));
    }

    @GetMapping("/date/{date}")
    @PreAuthorize("hasAnyRole('ADMIN', 'WARDEN', 'STUDENT')")
    @Operation(summary = "Get Attendance by Date", description = "Retrieves attendance records for a given date (yyyy-MM-dd).")
    public ResponseEntity<ApiResponse<List<AttendanceDto>>> getAttendanceByDate(
            @PathVariable("date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(ApiResponse.success("Attendance retrieved", hostelService.getAttendanceByDate(date)));
    }

    @GetMapping("/student/{studentId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'WARDEN', 'STUDENT')")
    @Operation(summary = "Get Attendance by Student ID", description = "Retrieves attendance history for a student.")
    public ResponseEntity<ApiResponse<List<AttendanceDto>>> getAttendanceByStudent(@PathVariable("studentId") String studentId) {
        Long numericId = null;
        try { numericId = Long.parseLong(studentId); } catch (Exception ignored) {}
        return ResponseEntity.ok(ApiResponse.success("Student attendance retrieved", hostelService.getAttendanceByStudent(numericId)));
    }

    @GetMapping("/month/{studentId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'WARDEN', 'STUDENT')")
    @Operation(summary = "Get Monthly Attendance", description = "Retrieves student attendance for a given month and year.")
    public ResponseEntity<ApiResponse<List<AttendanceDto>>> getAttendanceByMonth(
            @PathVariable("studentId") String studentId, @RequestParam("year") int year, @RequestParam("month") int month) {
        Long numericId = null;
        try { numericId = Long.parseLong(studentId); } catch (Exception ignored) {}
        return ResponseEntity.ok(ApiResponse.success("Monthly attendance retrieved", hostelService.getAttendanceByMonth(numericId, year, month)));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'WARDEN', 'STUDENT')")
    @Operation(summary = "Get All Attendance Records", description = "Retrieves all recorded attendance.")
    public ResponseEntity<ApiResponse<List<AttendanceDto>>> getAllAttendance() {
        return ResponseEntity.ok(ApiResponse.success("All attendance records retrieved", hostelService.getAllAttendance()));
    }
}

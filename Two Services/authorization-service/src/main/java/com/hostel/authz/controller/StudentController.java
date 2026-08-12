package com.hostel.authz.controller;

import com.hostel.authz.dto.*;
import com.hostel.authz.service.HostelManagementService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/students")
@Tag(name = "Student Management", description = "Endpoints for managing student profiles and records")
public class StudentController {

    private final HostelManagementService hostelService;

    public StudentController(HostelManagementService hostelService) {
        this.hostelService = hostelService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'WARDEN')")
    @Operation(summary = "Create Student Profile", description = "Creates a new student record associated with a user account.")
    public ResponseEntity<ApiResponse<StudentDto>> createStudent(@Valid @RequestBody CreateStudentRequest request) {
        StudentDto student = hostelService.createStudent(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Student profile created successfully", student));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'WARDEN')")
    @Operation(summary = "Update Student Profile", description = "Updates student details by ID.")
    public ResponseEntity<ApiResponse<StudentDto>> updateStudent(@PathVariable("id") String id, @RequestBody StudentDto dto) {
        StudentDto updated = hostelService.updateStudent(id, dto);
        return ResponseEntity.ok(ApiResponse.success("Student profile updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'WARDEN')")
    @Operation(summary = "Delete Student", description = "Deletes a student record by ID.")
    public ResponseEntity<ApiResponse<Void>> deleteStudent(@PathVariable("id") String id) {
        hostelService.deleteStudent(id);
        return ResponseEntity.ok(ApiResponse.success("Student deleted successfully"));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'WARDEN', 'STUDENT')")
    @Operation(summary = "Get Student by ID", description = "Retrieves student record details by ID.")
    public ResponseEntity<ApiResponse<StudentDto>> getStudentById(@PathVariable("id") String id, Authentication authentication) {
        if (authentication != null && authentication.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_STUDENT")) && authentication.getAuthorities().stream().noneMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_WARDEN"))) {
            StudentDto currentStudent = hostelService.getStudentByUsername(authentication.getName());
            if (currentStudent != null && currentStudent.getUserId() != null && !String.valueOf(currentStudent.getUserId()).equals(id)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(ApiResponse.error("Access denied: You can only view your own student profile"));
            }
        }
        return ResponseEntity.ok(ApiResponse.success("Student details retrieved", hostelService.getStudentById(id)));
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Get Current Student Profile", description = "Retrieves profile details for the currently logged-in student.")
    public ResponseEntity<ApiResponse<StudentDto>> getMyProfile(Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.success("Profile retrieved", hostelService.getStudentByUsername(authentication.getName())));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'WARDEN')")
    @Operation(summary = "Get All Students", description = "Retrieves a list of all registered students.")
    public ResponseEntity<ApiResponse<List<StudentDto>>> getAllStudents() {
        return ResponseEntity.ok(ApiResponse.success("Students retrieved", hostelService.getAllStudents()));
    }

    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('ADMIN', 'WARDEN')")
    @Operation(summary = "Search Students", description = "Search students by name, roll number, department, or block.")
    public ResponseEntity<ApiResponse<List<StudentDto>>> searchStudents(@RequestParam(value = "query", required = false) String query) {
        return ResponseEntity.ok(ApiResponse.success("Students search results retrieved", hostelService.searchStudents(query)));
    }
}

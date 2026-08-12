package com.hostel.authz.controller;

import com.hostel.authz.entity.ApiAccessLog;
import com.hostel.authz.entity.AuditLog;
import com.hostel.authz.entity.LoginHistory;
import com.hostel.authz.dto.ApiResponse;
import com.hostel.authz.service.AuthorizationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/authz/audit")
@Tag(name = "Audit & Logging Controller", description = "Endpoints for Audit Logs, Login History, and API Access Logs")
public class AuditController {

    private final AuthorizationService authorizationService;

    public AuditController(AuthorizationService authorizationService) {
        this.authorizationService = authorizationService;
    }

    @PostMapping("/logs")
    @Operation(summary = "Record an audit log entry")
    public ResponseEntity<ApiResponse<AuditLog>> logAudit(@RequestBody AuditLog auditLog) {
        return ResponseEntity.ok(ApiResponse.success("Audit log saved", authorizationService.logAudit(auditLog)));
    }

    @GetMapping("/logs")
    @Operation(summary = "Get all audit logs")
    public ResponseEntity<ApiResponse<List<AuditLog>>> getAllAuditLogs() {
        return ResponseEntity.ok(ApiResponse.success("Audit logs retrieved", authorizationService.getAuditLogs()));
    }

    @PostMapping("/login-history")
    @Operation(summary = "Record login history entry")
    public ResponseEntity<ApiResponse<LoginHistory>> recordLoginHistory(@RequestBody LoginHistory loginHistory) {
        return ResponseEntity.ok(ApiResponse.success("Login history saved", authorizationService.recordLoginHistory(loginHistory)));
    }

    @GetMapping("/login-history")
    @Operation(summary = "Get all login history")
    public ResponseEntity<ApiResponse<List<LoginHistory>>> getLoginHistory() {
        return ResponseEntity.ok(ApiResponse.success("Login history retrieved", authorizationService.getLoginHistory()));
    }

    @PostMapping("/api-logs")
    @Operation(summary = "Record API Access log entry")
    public ResponseEntity<ApiResponse<ApiAccessLog>> recordApiLog(@RequestBody ApiAccessLog apiAccessLog) {
        return ResponseEntity.ok(ApiResponse.success("API access log saved", authorizationService.recordApiLog(apiAccessLog)));
    }

    @GetMapping("/api-logs")
    @Operation(summary = "Get all API access logs")
    public ResponseEntity<ApiResponse<List<ApiAccessLog>>> getApiAccessLogs() {
        return ResponseEntity.ok(ApiResponse.success("API access logs retrieved", authorizationService.getApiAccessLogs()));
    }
}

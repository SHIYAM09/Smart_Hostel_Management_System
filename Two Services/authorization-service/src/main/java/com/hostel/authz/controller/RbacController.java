package com.hostel.authz.controller;

import com.hostel.authz.entity.RolePermission;
import com.hostel.authz.dto.ApiResponse;
import com.hostel.authz.dto.RolePermissionDto;
import com.hostel.authz.service.AuthorizationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/authz/rbac")
@Tag(name = "RBAC & Permission Management Controller", description = "Role and Permission mapping endpoints")
public class RbacController {

    private final AuthorizationService authorizationService;

    public RbacController(AuthorizationService authorizationService) {
        this.authorizationService = authorizationService;
    }

    @PostMapping("/permissions")
    @Operation(summary = "Assign or update permissions for a Role")
    public ResponseEntity<ApiResponse<RolePermission>> updatePermissions(@Valid @RequestBody RolePermissionDto dto) {
        RolePermission updated = authorizationService.saveOrUpdatePermissions(dto);
        return ResponseEntity.ok(ApiResponse.success("Permissions updated successfully", updated));
    }

    @GetMapping("/permissions/{role}")
    @Operation(summary = "Get permissions for a specific Role")
    public ResponseEntity<ApiResponse<RolePermission>> getPermissionsByRole(@PathVariable String role) {
        RolePermission permissions = authorizationService.getPermissionsForRole(role);
        return ResponseEntity.ok(ApiResponse.success("Role permissions retrieved", permissions));
    }

    @GetMapping("/permissions")
    @Operation(summary = "Get all Role permissions mapping")
    public ResponseEntity<ApiResponse<List<RolePermission>>> getAllPermissions() {
        return ResponseEntity.ok(ApiResponse.success("All permissions retrieved", authorizationService.getAllPermissions()));
    }
}

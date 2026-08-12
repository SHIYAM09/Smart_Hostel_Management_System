package com.hostel.auth.controller;

import com.hostel.auth.dto.ApiResponse;
import com.hostel.auth.entity.Role;
import com.hostel.auth.security.ResourceNotFoundException;
import com.hostel.auth.repository.RoleRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/roles")
@Tag(name = "Role Controller", description = "Role Management APIs for system administrators")
public class RoleController {

    private final RoleRepository roleRepository;

    public RoleController(RoleRepository roleRepository) {
        this.roleRepository = roleRepository;
    }

    @GetMapping
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @Operation(summary = "Get all roles")
    public ResponseEntity<ApiResponse<List<Role>>> getAllRoles() {
        return ResponseEntity.ok(ApiResponse.success("Roles retrieved", roleRepository.findAll()));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @Operation(summary = "Create a new role")
    public ResponseEntity<ApiResponse<Role>> createRole(@Valid @RequestBody Role role) {
        if (!role.getName().startsWith("ROLE_")) {
            role.setName("ROLE_" + role.getName().toUpperCase());
        }
        Role saved = roleRepository.save(role);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Role created successfully", saved));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @Operation(summary = "Update an existing role")
    public ResponseEntity<ApiResponse<Role>> updateRole(@PathVariable Long id, @Valid @RequestBody Role roleDto) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Role not found with id: " + id));

        if (roleDto.getName() != null) {
            String name = roleDto.getName().startsWith("ROLE_") ? roleDto.getName() : "ROLE_" + roleDto.getName().toUpperCase();
            role.setName(name);
        }
        if (roleDto.getDescription() != null) {
            role.setDescription(roleDto.getDescription());
        }

        return ResponseEntity.ok(ApiResponse.success("Role updated successfully", roleRepository.save(role)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @Operation(summary = "Delete role by ID")
    public ResponseEntity<ApiResponse<String>> deleteRole(@PathVariable Long id) {
        if (!roleRepository.existsById(id)) {
            throw new ResourceNotFoundException("Role not found with id: " + id);
        }
        roleRepository.deleteById(id);
        return ResponseEntity.ok(ApiResponse.success("Role deleted successfully", null));
    }
}

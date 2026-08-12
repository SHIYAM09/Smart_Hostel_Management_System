package com.hostel.authz.dto;

import jakarta.validation.constraints.NotBlank;
import java.util.Set;

public class RolePermissionDto {
    @NotBlank(message = "Role is required")
    private String role;
    private String roleName;
    private Set<String> permissions;

    public RolePermissionDto() {}

    public String getRole() { return role != null ? role : roleName; }
    public void setRole(String role) { this.role = role; }

    public String getRoleName() { return roleName != null ? roleName : role; }
    public void setRoleName(String roleName) { this.roleName = roleName; }

    public Set<String> getPermissions() { return permissions; }
    public void setPermissions(Set<String> permissions) { this.permissions = permissions; }
}

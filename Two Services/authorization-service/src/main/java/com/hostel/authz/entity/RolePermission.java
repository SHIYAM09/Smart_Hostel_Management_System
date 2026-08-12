package com.hostel.authz.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "role_permissions")
public class RolePermission {

    @Id
    private String id;

    private String role;
    private String roleName;
    private Set<String> permissions;
}

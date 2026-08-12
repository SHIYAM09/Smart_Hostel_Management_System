package com.hostel.authz.repository;

import com.hostel.authz.entity.RolePermission;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RolePermissionRepository extends MongoRepository<RolePermission, String> {
    Optional<RolePermission> findByRole(String role);
    Optional<RolePermission> findByRoleName(String roleName);
}

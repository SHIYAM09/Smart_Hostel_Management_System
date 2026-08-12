package com.hostel.authz.service;

import com.hostel.authz.entity.*;
import com.hostel.authz.dto.*;

import java.util.List;

public interface AuthorizationService {
    JwtValidationResponse validateToken(String token);
    ApiResponse<String> blacklistToken(BlacklistRequest request);
    boolean isTokenBlacklisted(String token);
    
    RolePermission saveOrUpdatePermissions(RolePermissionDto dto);
    RolePermission getPermissionsForRole(String role);
    List<RolePermission> getAllPermissions();

    AuditLog logAudit(AuditLog auditLog);
    List<AuditLog> getAuditLogs();
    List<AuditLog> getAuditLogsByUser(String username);

    LoginHistory recordLoginHistory(LoginHistory loginHistory);
    List<LoginHistory> getLoginHistory();

    ApiAccessLog recordApiLog(ApiAccessLog apiAccessLog);
    List<ApiAccessLog> getApiAccessLogs();

    AiChatHistory saveAiChat(AiChatHistory chat);
    List<AiChatHistory> getAiChatHistory(String username);
}

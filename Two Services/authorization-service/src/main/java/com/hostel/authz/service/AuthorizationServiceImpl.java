package com.hostel.authz.service;

import com.hostel.authz.entity.*;
import com.hostel.authz.dto.*;
import com.hostel.authz.repository.*;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AuthorizationServiceImpl implements AuthorizationService {

    private final JwtBlacklistRepository blacklistRepository;
    private final RolePermissionRepository permissionRepository;
    private final AuditLogRepository auditLogRepository;
    private final LoginHistoryRepository loginHistoryRepository;
    private final ApiAccessLogRepository apiAccessLogRepository;
    private final AiChatHistoryRepository aiChatHistoryRepository;
    private final com.hostel.authz.security.JwtUtil jwtUtil;

    public AuthorizationServiceImpl(JwtBlacklistRepository blacklistRepository,
                                    RolePermissionRepository permissionRepository,
                                    AuditLogRepository auditLogRepository,
                                    LoginHistoryRepository loginHistoryRepository,
                                    ApiAccessLogRepository apiAccessLogRepository,
                                    AiChatHistoryRepository aiChatHistoryRepository,
                                    @org.springframework.beans.factory.annotation.Autowired(required = false) com.hostel.authz.security.JwtUtil jwtUtil) {
        this.blacklistRepository = blacklistRepository;
        this.permissionRepository = permissionRepository;
        this.auditLogRepository = auditLogRepository;
        this.loginHistoryRepository = loginHistoryRepository;
        this.apiAccessLogRepository = apiAccessLogRepository;
        this.aiChatHistoryRepository = aiChatHistoryRepository;
        this.jwtUtil = jwtUtil;
    }

    @Override
    public JwtValidationResponse validateToken(String token) {
        boolean isBlacklisted = blacklistRepository.existsByToken(token);
        if (isBlacklisted) {
            return JwtValidationResponse.builder()
                    .valid(false)
                    .blacklisted(true)
                    .message("Token has been blacklisted")
                    .build();
        }
        boolean isValid = jwtUtil != null && jwtUtil.validateToken(token);
        String username = (isValid && jwtUtil != null) ? jwtUtil.getUsernameFromToken(token) : null;
        List<String> roles = (isValid && jwtUtil != null) ? jwtUtil.getRolesFromToken(token) : null;

        return JwtValidationResponse.builder()
                .valid(isValid)
                .blacklisted(false)
                .username(username)
                .roles(roles)
                .message(isValid ? "Token is valid" : "Invalid token")
                .build();
    }

    @Override
    public ApiResponse<String> blacklistToken(BlacklistRequest request) {
        JwtBlacklist blacklist = JwtBlacklist.builder()
                .token(request.getToken())
                .reason(request.getReason() != null ? request.getReason() : "MANUAL_REVOCATION")
                .blacklistedAt(LocalDateTime.now())
                .build();
        blacklistRepository.save(blacklist);
        return ApiResponse.success("Token blacklisted successfully");
    }

    @Override
    public boolean isTokenBlacklisted(String token) {
        return blacklistRepository.existsByToken(token);
    }

    @Override
    public RolePermission saveOrUpdatePermissions(RolePermissionDto dto) {
        RolePermission entity = permissionRepository.findByRoleName(dto.getRoleName())
                .orElseGet(() -> RolePermission.builder().roleName(dto.getRoleName()).role(dto.getRoleName()).build());
        entity.setPermissions(dto.getPermissions());
        return permissionRepository.save(entity);
    }

    @Override
    public RolePermission getPermissionsForRole(String role) {
        return permissionRepository.findByRoleName(role)
                .orElseGet(() -> RolePermission.builder().roleName(role).role(role).build());
    }

    @Override
    public List<RolePermission> getAllPermissions() {
        return permissionRepository.findAll();
    }

    @Override
    public AuditLog logAudit(AuditLog auditLog) {
        if (auditLog.getTimestamp() == null) {
            auditLog.setTimestamp(LocalDateTime.now());
        }
        return auditLogRepository.save(auditLog);
    }

    @Override
    public List<AuditLog> getAuditLogs() {
        return auditLogRepository.findAll();
    }

    @Override
    public List<AuditLog> getAuditLogsByUser(String username) {
        return auditLogRepository.findByUsername(username);
    }

    @Override
    public LoginHistory recordLoginHistory(LoginHistory loginHistory) {
        if (loginHistory.getTimestamp() == null) {
            loginHistory.setTimestamp(LocalDateTime.now());
        }
        return loginHistoryRepository.save(loginHistory);
    }

    @Override
    public List<LoginHistory> getLoginHistory() {
        return loginHistoryRepository.findAll();
    }

    @Override
    public ApiAccessLog recordApiLog(ApiAccessLog accessLog) {
        if (accessLog.getTimestamp() == null) {
            accessLog.setTimestamp(LocalDateTime.now());
        }
        return apiAccessLogRepository.save(accessLog);
    }

    @Override
    public List<ApiAccessLog> getApiAccessLogs() {
        return apiAccessLogRepository.findAll();
    }

    @Override
    public AiChatHistory saveAiChat(AiChatHistory chat) {
        if (chat.getTimestamp() == null) {
            chat.setTimestamp(LocalDateTime.now());
        }
        return aiChatHistoryRepository.save(chat);
    }

    @Override
    public List<AiChatHistory> getAiChatHistory(String username) {
        return aiChatHistoryRepository.findByUsername(username);
    }
}

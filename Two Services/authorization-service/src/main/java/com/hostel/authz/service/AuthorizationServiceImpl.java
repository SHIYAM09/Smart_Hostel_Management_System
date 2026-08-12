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

    public AuthorizationServiceImpl(JwtBlacklistRepository blacklistRepository,
                                    RolePermissionRepository permissionRepository,
                                    AuditLogRepository auditLogRepository,
                                    LoginHistoryRepository loginHistoryRepository,
                                    ApiAccessLogRepository apiAccessLogRepository,
                                    AiChatHistoryRepository aiChatHistoryRepository) {
        this.blacklistRepository = blacklistRepository;
        this.permissionRepository = permissionRepository;
        this.auditLogRepository = auditLogRepository;
        this.loginHistoryRepository = loginHistoryRepository;
        this.apiAccessLogRepository = apiAccessLogRepository;
        this.aiChatHistoryRepository = aiChatHistoryRepository;
    }

    @Override
    public JwtValidationResponse validateToken(String token) {
        boolean isBlacklisted = blacklistRepository.existsByToken(token);
        if (isBlacklisted) {
            return JwtValidationResponse.builder()
                    .valid(false)
                    .message("Token has been blacklisted")
                    .build();
        }
        return JwtValidationResponse.builder()
                .valid(true)
                .message("Token is valid")
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

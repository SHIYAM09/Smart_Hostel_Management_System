package com.hostel.authz.service;

import com.hostel.authz.dto.*;
import com.hostel.authz.repository.*;
import com.hostel.authz.security.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthorizationServiceTest {

    @Mock
    private JwtBlacklistRepository blacklistRepository;

    @Mock
    private RolePermissionRepository permissionRepository;

    @Mock
    private AuditLogRepository auditLogRepository;

    @Mock
    private LoginHistoryRepository loginHistoryRepository;

    @Mock
    private ApiAccessLogRepository apiAccessLogRepository;

    @Mock
    private AiChatHistoryRepository aiChatHistoryRepository;

    @Mock
    private JwtUtil jwtUtil;

    @InjectMocks
    private AuthorizationServiceImpl authorizationService;

    @BeforeEach
    void setUp() {}

    @Test
    void testValidateTokenValid() {
        String token = "valid_jwt_token";
        when(blacklistRepository.existsByToken(token)).thenReturn(false);
        when(jwtUtil.validateToken(token)).thenReturn(true);
        when(jwtUtil.getUsernameFromToken(token)).thenReturn("admin");
        when(jwtUtil.getRolesFromToken(token)).thenReturn(List.of("ROLE_ADMIN"));

        JwtValidationResponse response = authorizationService.validateToken(token);

        assertNotNull(response);
        assertTrue(response.isValid());
        assertFalse(response.isBlacklisted());
        assertEquals("admin", response.getUsername());
    }

    @Test
    void testValidateTokenBlacklisted() {
        String token = "blacklisted_jwt_token";
        when(blacklistRepository.existsByToken(token)).thenReturn(true);

        JwtValidationResponse response = authorizationService.validateToken(token);

        assertNotNull(response);
        assertFalse(response.isValid());
        assertTrue(response.isBlacklisted());
    }
}

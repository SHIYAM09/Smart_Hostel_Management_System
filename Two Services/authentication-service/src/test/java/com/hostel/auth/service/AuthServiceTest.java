package com.hostel.auth.service;

import com.hostel.auth.dto.*;
import com.hostel.auth.entity.Role;
import com.hostel.auth.entity.User;
import com.hostel.auth.repository.*;
import com.hostel.auth.security.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private RoleRepository roleRepository;

    @Mock
    private UserSessionRepository userSessionRepository;

    @Mock
    private RefreshTokenRepository refreshTokenRepository;

    @Mock
    private LoginHistoryRepository loginHistoryRepository;

    @Mock
    private JwtBlacklistRepository jwtBlacklistRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtUtil jwtUtil;

    @InjectMocks
    private AuthServiceImpl authService;

    private User sampleUser;

    @BeforeEach
    void setUp() {
        Role studentRole = Role.builder().id(1L).name("ROLE_STUDENT").build();
        sampleUser = User.builder()
                .id(100L)
                .username("student_alex")
                .email("alex@student.com")
                .password("encoded_pass")
                .fullName("Alex Smith")
                .roles(Set.of(studentRole))
                .build();
    }

    @Test
    void testLoginSuccess() {
        LoginRequest request = LoginRequest.builder()
                .usernameOrEmail("student_alex")
                .password("password123")
                .build();

        Authentication authMock = mock(Authentication.class);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(authMock);
        when(userRepository.findByUsername("student_alex")).thenReturn(Optional.of(sampleUser));
        when(jwtUtil.generateAccessToken(authMock)).thenReturn("mock_access_token");
        when(jwtUtil.generateRefreshToken("student_alex")).thenReturn("mock_refresh_token");

        AuthResponse response = authService.login(request, "127.0.0.1", "Mozilla");

        assertNotNull(response);
        assertEquals("mock_access_token", response.getAccessToken());
        assertEquals("mock_refresh_token", response.getRefreshToken());
        assertEquals("student_alex", response.getUsername());
        verify(loginHistoryRepository, times(1)).save(any());
        verify(userSessionRepository, times(1)).save(any());
    }
}

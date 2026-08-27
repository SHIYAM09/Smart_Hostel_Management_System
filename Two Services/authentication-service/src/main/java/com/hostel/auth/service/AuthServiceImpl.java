package com.hostel.auth.service;

import com.hostel.auth.entity.JwtBlacklist;
import com.hostel.auth.entity.LoginHistory;
import com.hostel.auth.entity.RefreshToken;
import com.hostel.auth.entity.UserSession;
import com.hostel.auth.dto.*;
import com.hostel.auth.entity.Role;
import com.hostel.auth.entity.User;
import com.hostel.auth.security.BadRequestException;
import com.hostel.auth.security.ResourceNotFoundException;
import com.hostel.auth.security.UnauthorizedException;
import com.hostel.auth.repository.*;
import com.hostel.auth.security.JwtUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AuthServiceImpl implements AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthServiceImpl.class);

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final UserSessionRepository userSessionRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final LoginHistoryRepository loginHistoryRepository;
    private final JwtBlacklistRepository jwtBlacklistRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;

    public AuthServiceImpl(UserRepository userRepository,
                           RoleRepository roleRepository,
                           UserSessionRepository userSessionRepository,
                           RefreshTokenRepository refreshTokenRepository,
                           LoginHistoryRepository loginHistoryRepository,
                           JwtBlacklistRepository jwtBlacklistRepository,
                           PasswordEncoder passwordEncoder,
                           AuthenticationManager authenticationManager,
                           JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.userSessionRepository = userSessionRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.loginHistoryRepository = loginHistoryRepository;
        this.jwtBlacklistRepository = jwtBlacklistRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
    }

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new BadRequestException("Username is already taken!");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already in use!");
        }

        Set<Role> roles = new HashSet<>();
        if (request.getRoles() == null || request.getRoles().isEmpty()) {
            Role userRole = roleRepository.findByName("ROLE_STUDENT")
                    .orElseGet(() -> roleRepository.save(Role.builder().name("ROLE_STUDENT").description("Student Role").build()));
            roles.add(userRole);
        } else {
            request.getRoles().forEach(roleStr -> {
                String formattedRole = roleStr.startsWith("ROLE_") ? roleStr : "ROLE_" + roleStr.toUpperCase();
                Role role = roleRepository.findByName(formattedRole)
                        .orElseGet(() -> roleRepository.save(Role.builder().name(formattedRole).description(formattedRole + " Role").build()));
                roles.add(role);
            });
        }

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .phone(request.getPhone())
                .active(true)
                .roles(roles)
                .build();

        userRepository.save(user);

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        String accessToken = jwtUtil.generateAccessToken(authentication);
        String refreshTokenStr = jwtUtil.generateRefreshToken(user.getUsername());

        refreshTokenRepository.save(RefreshToken.builder()
                .username(user.getUsername())
                .token(refreshTokenStr)
                .expiryDate(Instant.now().plusMillis(604800000))
                .revoked(false)
                .build());

        log.info("User registered successfully: {}", user.getUsername());

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshTokenStr)
                .userId(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .roles(user.getRoles().stream().map(Role::getName).collect(Collectors.toSet()))
                .build();
    }

    @Override
    public AuthResponse login(LoginRequest request, String ipAddress, String userAgent) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getUsernameOrEmail(), request.getPassword())
            );

            User user = userRepository.findByUsername(request.getUsernameOrEmail())
                    .orElseGet(() -> userRepository.findByEmail(request.getUsernameOrEmail())
                            .orElseThrow(() -> new ResourceNotFoundException("User not found")));

            String accessToken = jwtUtil.generateAccessToken(authentication);
            String refreshTokenStr = jwtUtil.generateRefreshToken(user.getUsername());

            userSessionRepository.save(UserSession.builder()
                    .username(user.getUsername())
                    .token(accessToken)
                    .ipAddress(ipAddress)
                    .userAgent(userAgent)
                    .loginTime(LocalDateTime.now())
                    .lastAccessedTime(LocalDateTime.now())
                    .active(true)
                    .build());

            refreshTokenRepository.save(RefreshToken.builder()
                    .username(user.getUsername())
                    .token(refreshTokenStr)
                    .expiryDate(Instant.now().plusMillis(604800000))
                    .revoked(false)
                    .build());

            loginHistoryRepository.save(LoginHistory.builder()
                    .username(user.getUsername())
                    .status("SUCCESS")
                    .ipAddress(ipAddress)
                    .userAgent(userAgent)
                    .timestamp(LocalDateTime.now())
                    .build());

            log.info("User logged in successfully: {}", user.getUsername());

            return AuthResponse.builder()
                    .accessToken(accessToken)
                    .refreshToken(refreshTokenStr)
                    .userId(user.getId())
                    .username(user.getUsername())
                    .email(user.getEmail())
                    .fullName(user.getFullName())
                    .roles(user.getRoles().stream().map(Role::getName).collect(Collectors.toSet()))
                    .build();
        } catch (Exception e) {
            loginHistoryRepository.save(LoginHistory.builder()
                    .username(request.getUsernameOrEmail())
                    .status("FAILED")
                    .ipAddress(ipAddress)
                    .userAgent(userAgent)
                    .failureReason(e.getMessage())
                    .timestamp(LocalDateTime.now())
                    .build());
            throw new UnauthorizedException("Invalid username or password!");
        }
    }

    @Override
    @Transactional
    public ApiResponse<String> logout(String token, String username) {
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
        }

        if (token != null) {
            jwtBlacklistRepository.save(JwtBlacklist.builder()
                    .token(token)
                    .username(username)
                    .reason("User logged out")
                    .blacklistedAt(LocalDateTime.now())
                    .build());
        }

        if (username != null) {
            userSessionRepository.findByUsernameAndActiveTrue(username)
                    .forEach(session -> {
                        session.setActive(false);
                        userSessionRepository.save(session);
                    });
            refreshTokenRepository.deleteByUsername(username);
        }

        log.info("User logged out: {}", username);
        return ApiResponse.success("User logged out successfully.");
    }

    @Override
    public TokenRefreshResponse refreshToken(RefreshTokenRequest request) {
        RefreshToken storedToken = refreshTokenRepository.findByToken(request.getRefreshToken())
                .orElseThrow(() -> new UnauthorizedException("Invalid refresh token"));

        if (storedToken.isRevoked() || storedToken.getExpiryDate().isBefore(Instant.now())) {
            throw new UnauthorizedException("Refresh token was expired or revoked");
        }

        if (!jwtUtil.validateToken(request.getRefreshToken())) {
            throw new UnauthorizedException("Invalid or expired refresh token!");
        }

        String username = jwtUtil.getUsernameFromToken(request.getRefreshToken());
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        Authentication authentication = new UsernamePasswordAuthenticationToken(
                user.getUsername(), null,
                user.getRoles().stream()
                        .map(r -> new org.springframework.security.core.authority.SimpleGrantedAuthority(r.getName()))
                        .collect(Collectors.toList())
        );

        String newAccessToken = jwtUtil.generateAccessToken(authentication);
        String newRefreshToken = jwtUtil.generateRefreshToken(user.getUsername());

        storedToken.setRevoked(true);
        refreshTokenRepository.save(storedToken);

        refreshTokenRepository.save(RefreshToken.builder()
                .username(user.getUsername())
                .token(newRefreshToken)
                .expiryDate(Instant.now().plusMillis(604800000))
                .revoked(false)
                .build());

        return TokenRefreshResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefreshToken)
                .build();
    }

    @Override
    public ApiResponse<String> changePassword(String username, ChangePasswordRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new BadRequestException("Incorrect old password!");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        log.info("Password changed for user: {}", username);
        return ApiResponse.success("Password changed successfully.");
    }

    @Override
    public ApiResponse<String> forgotPassword(ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + request.getEmail()));

        String resetToken = String.format("%06d", new Random().nextInt(900000) + 100000);
        user.setResetToken(resetToken);
        user.setResetTokenExpiry(LocalDateTime.now().plusMinutes(15));
        userRepository.save(user);

        log.info("OTP generated for forgot password: {}", resetToken);
        return ApiResponse.success("Password reset OTP generated: " + resetToken, resetToken);
    }

    @Override
    public ApiResponse<String> resetPassword(ResetPasswordRequest request) {
        User user = userRepository.findByResetToken(request.getToken())
                .orElseThrow(() -> new BadRequestException("Invalid reset token!"));

        if (user.getResetTokenExpiry() == null || user.getResetTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Reset token has expired!");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        userRepository.save(user);

        log.info("Password reset successfully for user: {}", user.getUsername());
        return ApiResponse.success("Password reset successfully.");
    }

    @Override
    public ApiResponse<String> verifyOtp(OtpVerifyRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + request.getEmail()));

        if (user.getResetToken() == null || !user.getResetToken().equals(request.getOtpCode())) {
            throw new BadRequestException("Invalid OTP code");
        }

        if (user.getResetTokenExpiry() == null || user.getResetTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("OTP code has expired");
        }

        return ApiResponse.success("OTP verified successfully.");
    }

    @Override
    public AuthMeDto getMe(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + username));

        return AuthMeDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .active(user.isActive())
                .roles(user.getRoles().stream().map(Role::getName).collect(Collectors.toSet()))
                .build();
    }

    @Override
    public List<LoginHistory> getLoginHistory(String username) {
        return loginHistoryRepository.findByUsernameOrderByTimestampDesc(username);
    }

    @Override
    public List<UserSession> getUserSessions(String username) {
        return userSessionRepository.findByUsernameAndActiveTrue(username);
    }
}

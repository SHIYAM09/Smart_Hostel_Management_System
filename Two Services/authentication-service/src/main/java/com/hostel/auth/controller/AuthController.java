package com.hostel.auth.controller;

import com.hostel.auth.dto.*;
import com.hostel.auth.entity.LoginHistory;
import com.hostel.auth.entity.UserSession;
import com.hostel.auth.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/auth")
@Tag(name = "Authentication Service", description = "Endpoints for Register, Login, Logout, Refresh Token, Password Operations, OTP, and Session Management")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    @Operation(summary = "Register a new user", description = "Creates a new user account (Student, Warden, or Admin) and returns JWT access/refresh tokens.")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "User registered successfully",
            content = @Content(schema = @Schema(implementation = ApiResponse.class))),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid request payload or duplicate user",
            content = @Content(schema = @Schema(implementation = ApiResponse.class)))
    })
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("User registered successfully", response));
    }

    @PostMapping("/login")
    @Operation(summary = "User Login", description = "Authenticates user and returns JWT Access & Refresh tokens with user details.")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Login successful",
            content = @Content(schema = @Schema(implementation = ApiResponse.class))),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized - Invalid credentials",
            content = @Content(schema = @Schema(implementation = ApiResponse.class)))
    })
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request, HttpServletRequest httpRequest) {
        String ipAddress = httpRequest.getRemoteAddr();
        String userAgent = httpRequest.getHeader("User-Agent");
        AuthResponse response = authService.login(request, ipAddress, userAgent);
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }

    @PostMapping("/logout")
    @Operation(summary = "Logout User", description = "Invalidates the current session and blacklists the JWT token.")
    public ResponseEntity<ApiResponse<String>> logout(@RequestHeader(value = "Authorization", required = false) String token,
                                                      Authentication authentication) {
        String username = authentication != null ? authentication.getName() : null;
        return ResponseEntity.ok(authService.logout(token, username));
    }

    @PostMapping("/refresh")
    @Operation(summary = "Refresh Token", description = "Generates a new JWT access token using a valid Refresh Token.")
    public ResponseEntity<ApiResponse<TokenRefreshResponse>> refreshToken(@Valid @RequestBody RefreshTokenRequest request) {
        TokenRefreshResponse response = authService.refreshToken(request);
        return ResponseEntity.ok(ApiResponse.success("Token refreshed successfully", response));
    }

    @PostMapping("/change-password")
    @Operation(summary = "Change Password", description = "Updates password for authenticated user.")
    public ResponseEntity<ApiResponse<String>> changePassword(Authentication authentication,
                                                               @Valid @RequestBody ChangePasswordRequest request) {
        return ResponseEntity.ok(authService.changePassword(authentication.getName(), request));
    }

    @PostMapping("/forgot-password")
    @Operation(summary = "Forgot Password", description = "Generates password reset OTP for the registered email.")
    public ResponseEntity<ApiResponse<String>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        return ResponseEntity.ok(authService.forgotPassword(request));
    }

    @PostMapping("/reset-password")
    @Operation(summary = "Reset Password", description = "Resets user password using reset token / OTP.")
    public ResponseEntity<ApiResponse<String>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        return ResponseEntity.ok(authService.resetPassword(request));
    }

    @PostMapping("/verify-otp")
    @Operation(summary = "Verify OTP", description = "Verifies password reset 6-digit OTP code.")
    public ResponseEntity<ApiResponse<String>> verifyOtp(@Valid @RequestBody OtpVerifyRequest request) {
        return ResponseEntity.ok(authService.verifyOtp(request));
    }

    @GetMapping("/me")
    @Operation(summary = "Get Profile", description = "Returns profile details of currently authenticated user.")
    public ResponseEntity<ApiResponse<AuthMeDto>> getMe(Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.success("User details retrieved", authService.getMe(authentication.getName())));
    }

    @GetMapping("/history")
    @Operation(summary = "Get Login History", description = "Retrieves login history stored in MongoDB for current user.")
    public ResponseEntity<ApiResponse<List<LoginHistory>>> getLoginHistory(Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.success("Login history retrieved", authService.getLoginHistory(authentication.getName())));
    }

    @GetMapping("/sessions")
    @Operation(summary = "Get Active User Sessions", description = "Retrieves active sessions stored in MongoDB for current user.")
    public ResponseEntity<ApiResponse<List<UserSession>>> getUserSessions(Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.success("Active sessions retrieved", authService.getUserSessions(authentication.getName())));
    }
}

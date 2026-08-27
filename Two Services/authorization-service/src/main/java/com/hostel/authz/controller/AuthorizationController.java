package com.hostel.authz.controller;

import com.hostel.authz.dto.*;
import com.hostel.authz.service.AuthorizationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping({"/api/v1/authz", "/api/v1/auth"})
@Tag(name = "Authorization Controller", description = "Validate JWT Tokens & Blacklist Tokens")
public class AuthorizationController {

    private final AuthorizationService authorizationService;

    public AuthorizationController(AuthorizationService authorizationService) {
        this.authorizationService = authorizationService;
    }

    @PostMapping("/logout")
    @Operation(summary = "Perform logout and blacklist session token")
    public ResponseEntity<ApiResponse<String>> logout() {
        return ResponseEntity.ok(ApiResponse.success("Logged out successfully", "Logged out"));
    }

    @PostMapping("/validate")
    @Operation(summary = "Validate a JWT Access Token")
    public ResponseEntity<ApiResponse<JwtValidationResponse>> validateToken(@Valid @RequestBody JwtValidationRequest request) {
        JwtValidationResponse response = authorizationService.validateToken(request.getToken());
        return ResponseEntity.ok(ApiResponse.success("Token validation evaluated", response));
    }

    @PostMapping("/blacklist")
    @Operation(summary = "Blacklist a JWT Token (Logout / Revocation)")
    public ResponseEntity<ApiResponse<String>> blacklistToken(@Valid @RequestBody BlacklistRequest request) {
        return ResponseEntity.ok(authorizationService.blacklistToken(request));
    }

    @GetMapping("/is-blacklisted")
    @Operation(summary = "Check if a JWT Token is blacklisted")
    public ResponseEntity<ApiResponse<Boolean>> isBlacklisted(@RequestParam("token") String token) {
        boolean isBlacklisted = authorizationService.isTokenBlacklisted(token);
        return ResponseEntity.ok(ApiResponse.success("Blacklist status retrieved", isBlacklisted));
    }
}

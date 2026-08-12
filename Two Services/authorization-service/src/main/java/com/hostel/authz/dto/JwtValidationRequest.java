package com.hostel.authz.dto;

import jakarta.validation.constraints.NotBlank;

public class JwtValidationRequest {
    @NotBlank(message = "JWT Token is required")
    private String token;

    public JwtValidationRequest() {}

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
}

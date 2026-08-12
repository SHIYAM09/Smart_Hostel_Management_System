package com.hostel.authz.dto;

import jakarta.validation.constraints.NotBlank;

public class BlacklistRequest {
    @NotBlank(message = "Token is required")
    private String token;
    private String username;
    private String reason;

    public BlacklistRequest() {}

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
}

package com.hostel.auth.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginRequest {

    private String username;
    private String usernameOrEmail;

    @NotBlank(message = "Password is required")
    private String password;

    public String getUsernameOrEmail() {
        if (usernameOrEmail != null && !usernameOrEmail.isBlank()) {
            return usernameOrEmail;
        }
        return username != null ? username : "";
    }

    public String getUsername() {
        return getUsernameOrEmail();
    }
}

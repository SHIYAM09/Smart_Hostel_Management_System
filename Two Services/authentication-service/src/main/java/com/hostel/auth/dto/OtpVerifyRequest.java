package com.hostel.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OtpVerifyRequest {

    private String username;
    private String email;
    private String otp;
    private String otpCode;

    public String getEmail() {
        return email != null ? email : username;
    }

    public String getOtpCode() {
        return otpCode != null ? otpCode : otp;
    }
}

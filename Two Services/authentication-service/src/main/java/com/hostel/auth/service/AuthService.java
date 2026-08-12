package com.hostel.auth.service;

import com.hostel.auth.dto.*;
import com.hostel.auth.entity.LoginHistory;
import com.hostel.auth.entity.UserSession;

import java.util.List;

public interface AuthService {
    AuthResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request, String ipAddress, String userAgent);
    ApiResponse<String> logout(String token, String username);
    TokenRefreshResponse refreshToken(RefreshTokenRequest request);
    ApiResponse<String> changePassword(String username, ChangePasswordRequest request);
    ApiResponse<String> forgotPassword(ForgotPasswordRequest request);
    ApiResponse<String> resetPassword(ResetPasswordRequest request);
    ApiResponse<String> verifyOtp(OtpVerifyRequest request);
    AuthMeDto getMe(String username);
    List<LoginHistory> getLoginHistory(String username);
    List<UserSession> getUserSessions(String username);
}

package com.hostel.authz.service;

public interface AiAssistantService {
    String processMessage(String message, String username, String role);
}

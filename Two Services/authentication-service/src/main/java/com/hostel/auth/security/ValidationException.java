package com.hostel.auth.security;

public class ValidationException extends RuntimeException {
    public ValidationException(String message) {
        super(message);
    }
}

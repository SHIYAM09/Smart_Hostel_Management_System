package com.hostel.authz.security;

public class ValidationException extends RuntimeException {
    public ValidationException(String message) {
        super(message);
    }
}

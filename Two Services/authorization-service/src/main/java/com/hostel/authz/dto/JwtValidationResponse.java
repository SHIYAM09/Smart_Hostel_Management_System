package com.hostel.authz.dto;

import java.util.List;

public class JwtValidationResponse {
    private boolean valid;
    private String username;
    private List<String> roles;
    private boolean blacklisted;
    private String message;

    public JwtValidationResponse() {}

    public JwtValidationResponse(boolean valid, String username, List<String> roles, boolean blacklisted, String message) {
        this.valid = valid;
        this.username = username;
        this.roles = roles;
        this.blacklisted = blacklisted;
        this.message = message;
    }

    public static JwtValidationResponseBuilder builder() { return new JwtValidationResponseBuilder(); }

    public static class JwtValidationResponseBuilder {
        private boolean valid;
        private String username;
        private List<String> roles;
        private boolean blacklisted;
        private String message;

        public JwtValidationResponseBuilder valid(boolean valid) { this.valid = valid; return this; }
        public JwtValidationResponseBuilder username(String username) { this.username = username; return this; }
        public JwtValidationResponseBuilder roles(List<String> roles) { this.roles = roles; return this; }
        public JwtValidationResponseBuilder blacklisted(boolean blacklisted) { this.blacklisted = blacklisted; return this; }
        public JwtValidationResponseBuilder message(String message) { this.message = message; return this; }

        public JwtValidationResponse build() {
            return new JwtValidationResponse(valid, username, roles, blacklisted, message);
        }
    }

    public boolean isValid() { return valid; }
    public void setValid(boolean valid) { this.valid = valid; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public List<String> getRoles() { return roles; }
    public void setRoles(List<String> roles) { this.roles = roles; }
    public boolean isBlacklisted() { return blacklisted; }
    public void setBlacklisted(boolean blacklisted) { this.blacklisted = blacklisted; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}

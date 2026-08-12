package com.hostel.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthMeDto {

    private Long id;
    private String username;
    private String email;
    private String fullName;
    private String phone;
    private Set<String> roles;
    private boolean active;
}

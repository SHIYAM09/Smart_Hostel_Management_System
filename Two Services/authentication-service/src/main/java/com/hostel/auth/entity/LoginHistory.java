package com.hostel.auth.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "LOGIN_HISTORY")
public class LoginHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String username;
    private String status; // SUCCESS, FAILED, LOGOUT
    private String ipAddress;
    private String userAgent;
    private String failureReason;
    private LocalDateTime timestamp;
}

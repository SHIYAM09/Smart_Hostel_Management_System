package com.hostel.authz.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "login_history")
public class LoginHistory {

    @Id
    private String id;

    private String username;
    private String status;
    private String ipAddress;
    private String userAgent;
    private String failureReason;
    private LocalDateTime loginTime;
    private LocalDateTime timestamp;
}

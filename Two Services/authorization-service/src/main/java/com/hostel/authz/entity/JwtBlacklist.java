package com.hostel.authz.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "jwt_blacklist")
public class JwtBlacklist {

    @Id
    private String id;

    private String token;
    private String username;
    private String reason;
    private LocalDateTime blacklistedAt;
    private LocalDateTime expiresAt;
}

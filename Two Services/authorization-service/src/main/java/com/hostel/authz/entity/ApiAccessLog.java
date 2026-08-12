package com.hostel.authz.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "api_access_logs")
public class ApiAccessLog {

    @Id
    private String id;

    private String path;
    private String method;
    private String username;
    private Integer statusCode;
    private Long executionTimeMs;
    private LocalDateTime timestamp;
}

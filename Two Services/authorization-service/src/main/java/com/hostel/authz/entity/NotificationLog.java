package com.hostel.authz.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "notification_logs")
public class NotificationLog {

    @Id
    private String id;

    private String title;
    private String message;
    private String recipientRole;
    private LocalDateTime sentAt;
}

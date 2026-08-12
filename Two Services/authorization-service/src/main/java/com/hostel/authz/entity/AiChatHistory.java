package com.hostel.authz.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "ai_chat_history")
public class AiChatHistory {

    @Id
    private String id;

    private String username;
    private String role;
    private String prompt;
    private String response;
    private LocalDateTime timestamp;
}

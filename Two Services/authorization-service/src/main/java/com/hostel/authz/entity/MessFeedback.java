package com.hostel.authz.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "mess_feedback")
public class MessFeedback {

    @Id
    private String id;

    private String studentId;
    private String studentName;
    private String mealType; // BREAKFAST, LUNCH, SNACKS, DINNER
    private Integer rating;
    private String comments;
    private LocalDateTime createdAt;
}

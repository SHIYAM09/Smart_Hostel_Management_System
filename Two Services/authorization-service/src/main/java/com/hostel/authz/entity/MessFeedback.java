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
    private String date;

    private Integer breakfastRating;
    private Integer lunchRating;
    private Integer snacksRating;
    private Integer dinnerRating;

    private String breakfastComment;
    private String lunchComment;
    private String snacksComment;
    private String dinnerComment;

    private Double overallRating;

    // Legacy fields for backwards compatibility
    private String mealType;
    private Integer rating;
    private String comments;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

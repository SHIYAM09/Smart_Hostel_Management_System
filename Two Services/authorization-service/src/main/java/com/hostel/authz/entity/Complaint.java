package com.hostel.authz.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "complaints")
public class Complaint {

    @Id
    private String id;

    private String studentId;
    private String studentName;
    private String roomNumber;
    private String category;
    private String title;
    private String subject;
    private String description;
    private String status; // OPEN, IN_PROGRESS, RESOLVED, REJECTED
    private String priority; // LOW, MEDIUM, HIGH
    private String wardenRemarks;
    private String wardenReply;
    private Integer rating;
    private String feedbackComment;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

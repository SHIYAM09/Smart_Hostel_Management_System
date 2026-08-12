package com.hostel.authz.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "complaint_feedbacks")
public class Feedback {

    @Id
    private String id;

    private String complaintId;
    private String studentId;
    private Integer rating;
    private String comments;
    private LocalDateTime createdAt;
}

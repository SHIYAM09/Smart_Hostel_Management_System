package com.hostel.authz.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "leave_requests")
public class LeaveRequest {

    @Id
    private String id;

    private String studentId;
    private String studentName;
    private String roomNumber;
    private LocalDate startDate;
    private LocalDate endDate;
    private String reason;
    private String status; // PENDING, APPROVED, REJECTED
    private String wardenRemarks;
    private LocalDateTime createdAt;
    private LocalDateTime reviewedAt;
}

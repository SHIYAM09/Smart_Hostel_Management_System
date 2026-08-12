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
@Document(collection = "visitor_logs")
public class VisitorLog {

    @Id
    private String id;

    private String visitorId;
    private String visitorName;
    private String studentId;
    private String studentName;
    private String roomNumber;
    private String relation;
    private String phone;
    private String purpose;
    private String checkInTime;
    private String checkOutTime;
    private LocalDate logDate;
    private String status;
    private String riskLevel;
    private Boolean idVerified;
    private LocalDateTime createdAt;
}

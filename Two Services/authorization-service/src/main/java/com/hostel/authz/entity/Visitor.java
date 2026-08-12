package com.hostel.authz.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "visitors")
public class Visitor {

    @Id
    private String id;

    private String visitorName;
    private String studentId;
    private String studentName;
    private String roomNumber;
    private String phone;
    private String relationship;
    private String purpose;
    private String status;
    private String riskLevel;
    private Boolean idVerified;
    private LocalDateTime inTime;
    private LocalDateTime outTime;
}

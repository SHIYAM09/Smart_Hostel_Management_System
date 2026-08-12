package com.hostel.authz.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LeaveRequestDto {

    private String id;
    private Object studentId;
    private String studentName;
    private String roomNumber;
    private LocalDate startDate;
    private LocalDate endDate;
    private String reason;
    private String status;
    private String wardenRemarks;
    private LocalDateTime createdAt;
}

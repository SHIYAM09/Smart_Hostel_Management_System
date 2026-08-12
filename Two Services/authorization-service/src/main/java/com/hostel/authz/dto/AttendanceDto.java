package com.hostel.authz.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttendanceDto {

    private Object id;
    private Object studentId;
    private String studentName;
    private String rollNumber;
    private String roomNumber;
    private LocalDate attendanceDate;
    private String status;
    private String remarks;
}

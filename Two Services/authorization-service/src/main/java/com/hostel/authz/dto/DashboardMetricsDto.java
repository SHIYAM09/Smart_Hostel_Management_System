package com.hostel.authz.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardMetricsDto {

    private Long totalStudents;
    private Long totalWardens;
    private Long totalRooms;
    private Long occupiedRooms;
    private Long availableBeds;
    private Long pendingComplaints;
    private Long pendingLeaveRequests;
}

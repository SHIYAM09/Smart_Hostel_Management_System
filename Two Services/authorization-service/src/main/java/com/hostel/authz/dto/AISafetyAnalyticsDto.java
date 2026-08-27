package com.hostel.authz.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AISafetyAnalyticsDto {
    private List<Map<String, Object>> alerts;
    private List<Map<String, Object>> attendanceRisks;
    private Map<String, Object> utilitySpikes;
    private List<Map<String, Object>> visitorRisks;
}

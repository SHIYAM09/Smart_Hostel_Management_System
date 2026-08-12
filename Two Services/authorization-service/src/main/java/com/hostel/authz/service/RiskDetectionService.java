package com.hostel.authz.service;

import java.util.List;
import java.util.Map;

public interface RiskDetectionService {
    List<Map<String, Object>> generateSafetyAlerts();
}

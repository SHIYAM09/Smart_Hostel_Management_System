package com.hostel.authz.service;

import java.util.Map;

public interface ComplaintAnalyzerService {
    Map<String, Object> analyzeComplaint(String description);
}

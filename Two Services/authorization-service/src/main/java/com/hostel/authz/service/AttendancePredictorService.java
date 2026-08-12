package com.hostel.authz.service;

import java.util.Map;

public interface AttendancePredictorService {
    Map<String, Object> predictAttendanceRisks();
}

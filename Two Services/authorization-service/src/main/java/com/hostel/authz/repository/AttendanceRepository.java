package com.hostel.authz.repository;

import com.hostel.authz.entity.Attendance;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface AttendanceRepository extends MongoRepository<Attendance, String> {
    List<Attendance> findByStudentId(String studentId);
    List<Attendance> findByAttendanceDate(LocalDate attendanceDate);
    List<Attendance> findByStudentIdAndAttendanceDate(String studentId, LocalDate attendanceDate);
    List<Attendance> findByStudentIdAndAttendanceDateBetween(String studentId, LocalDate startDate, LocalDate endDate);
}

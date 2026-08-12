package com.hostel.authz.repository;

import com.hostel.authz.entity.LeaveRequest;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LeaveRequestRepository extends MongoRepository<LeaveRequest, String> {
    List<LeaveRequest> findByStudentId(String studentId);
    List<LeaveRequest> findByStatus(String status);
}

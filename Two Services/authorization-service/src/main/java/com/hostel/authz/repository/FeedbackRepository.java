package com.hostel.authz.repository;

import com.hostel.authz.entity.Feedback;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FeedbackRepository extends MongoRepository<Feedback, String> {
    List<Feedback> findByComplaintId(String complaintId);
    List<Feedback> findByStudentId(String studentId);
}

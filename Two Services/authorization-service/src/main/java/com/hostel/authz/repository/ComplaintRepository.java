package com.hostel.authz.repository;

import com.hostel.authz.entity.Complaint;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ComplaintRepository extends MongoRepository<Complaint, String> {
    List<Complaint> findByStudentId(String studentId);
    List<Complaint> findByStatus(String status);
    List<Complaint> findByCategory(String category);
}

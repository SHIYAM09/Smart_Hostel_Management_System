package com.hostel.authz.repository;

import com.hostel.authz.entity.VisitorLog;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VisitorLogRepository extends MongoRepository<VisitorLog, String> {
    List<VisitorLog> findByStatus(String status);
}

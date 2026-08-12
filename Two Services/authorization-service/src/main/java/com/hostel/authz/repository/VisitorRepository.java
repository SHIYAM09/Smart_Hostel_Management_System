package com.hostel.authz.repository;

import com.hostel.authz.entity.Visitor;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VisitorRepository extends MongoRepository<Visitor, String> {
    List<Visitor> findByStudentId(String studentId);
}

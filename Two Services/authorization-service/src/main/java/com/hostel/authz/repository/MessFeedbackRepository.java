package com.hostel.authz.repository;

import com.hostel.authz.entity.MessFeedback;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessFeedbackRepository extends MongoRepository<MessFeedback, String> {
    List<MessFeedback> findByStudentId(String studentId);
    List<MessFeedback> findByMealType(String mealType);
}

package com.hostel.authz.repository;

import com.hostel.authz.entity.MessFeedback;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MessFeedbackRepository extends MongoRepository<MessFeedback, String> {
    List<MessFeedback> findByStudentId(String studentId);
    List<MessFeedback> findByMealType(String mealType);
    Optional<MessFeedback> findByStudentIdAndDate(String studentId, String date);
    Optional<MessFeedback> findByStudentNameAndDate(String studentName, String date);
}

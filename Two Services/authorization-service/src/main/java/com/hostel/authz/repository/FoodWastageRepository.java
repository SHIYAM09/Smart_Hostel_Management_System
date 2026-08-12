package com.hostel.authz.repository;

import com.hostel.authz.entity.FoodWastage;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;

@Repository
public interface FoodWastageRepository extends MongoRepository<FoodWastage, String> {
    Optional<FoodWastage> findByLogDate(LocalDate logDate);
}

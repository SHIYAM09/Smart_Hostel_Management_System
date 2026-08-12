package com.hostel.authz.repository;

import com.hostel.authz.entity.MessMenu;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MessMenuRepository extends MongoRepository<MessMenu, String> {
    Optional<MessMenu> findByDayOfWeekIgnoreCase(String dayOfWeek);
}

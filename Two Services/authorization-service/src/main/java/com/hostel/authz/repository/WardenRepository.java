package com.hostel.authz.repository;

import com.hostel.authz.entity.Warden;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WardenRepository extends MongoRepository<Warden, String> {
    Optional<Warden> findByUserId(Long userId);
    List<Warden> findByHostelBlock(String hostelBlock);
}

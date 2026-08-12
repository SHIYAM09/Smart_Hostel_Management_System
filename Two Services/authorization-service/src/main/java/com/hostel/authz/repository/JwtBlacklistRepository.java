package com.hostel.authz.repository;

import com.hostel.authz.entity.JwtBlacklist;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface JwtBlacklistRepository extends MongoRepository<JwtBlacklist, String> {
    boolean existsByToken(String token);
    Optional<JwtBlacklist> findByToken(String token);
}

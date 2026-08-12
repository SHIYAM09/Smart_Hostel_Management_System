package com.hostel.authz.repository;

import com.hostel.authz.entity.HostelBlock;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface HostelBlockRepository extends MongoRepository<HostelBlock, String> {
    Optional<HostelBlock> findByName(String name);
}

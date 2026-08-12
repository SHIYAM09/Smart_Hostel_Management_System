package com.hostel.authz.repository;

import com.hostel.authz.entity.ResourceItem;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResourceItemRepository extends MongoRepository<ResourceItem, String> {
    List<ResourceItem> findByAnomalyTrue();
}

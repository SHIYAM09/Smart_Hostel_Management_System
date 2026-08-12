package com.hostel.authz.repository;

import com.hostel.authz.entity.ApiAccessLog;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ApiAccessLogRepository extends MongoRepository<ApiAccessLog, String> {
    List<ApiAccessLog> findByUsername(String username);
    List<ApiAccessLog> findByStatusCode(Integer statusCode);
}

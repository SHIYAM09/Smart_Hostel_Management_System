package com.hostel.authz.repository;

import com.hostel.authz.entity.LoginHistory;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LoginHistoryRepository extends MongoRepository<LoginHistory, String> {
    List<LoginHistory> findByUsernameOrderByTimestampDesc(String username);
}

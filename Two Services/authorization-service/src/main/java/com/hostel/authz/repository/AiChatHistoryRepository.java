package com.hostel.authz.repository;

import com.hostel.authz.entity.AiChatHistory;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AiChatHistoryRepository extends MongoRepository<AiChatHistory, String> {
    List<AiChatHistory> findByUsername(String username);
    List<AiChatHistory> findByUsernameOrderByTimestampDesc(String username);
}

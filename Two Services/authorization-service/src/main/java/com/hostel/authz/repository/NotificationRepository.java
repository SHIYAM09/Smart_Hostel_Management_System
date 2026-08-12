package com.hostel.authz.repository;

import com.hostel.authz.entity.Notification;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends MongoRepository<Notification, String> {
    List<Notification> findByForRoleOrForRole(String role1, String role2);
    List<Notification> findByUserIdOrderByCreatedAtDesc(String userId);
    List<Notification> findByReadFalse();
}

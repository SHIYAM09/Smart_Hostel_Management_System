package com.hostel.auth.repository;

import com.hostel.auth.entity.UserSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserSessionRepository extends JpaRepository<UserSession, Long> {
    List<UserSession> findByUsernameAndActiveTrue(String username);
    Optional<UserSession> findByTokenAndActiveTrue(String token);
}

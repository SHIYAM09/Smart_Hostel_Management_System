package com.hostel.authz.repository;

import com.hostel.authz.entity.UtilityMonitoring;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface UtilityMonitoringRepository extends MongoRepository<UtilityMonitoring, String> {
    List<UtilityMonitoring> findByHostelBlock(String hostelBlock);
    List<UtilityMonitoring> findByReadingDate(LocalDate readingDate);
}

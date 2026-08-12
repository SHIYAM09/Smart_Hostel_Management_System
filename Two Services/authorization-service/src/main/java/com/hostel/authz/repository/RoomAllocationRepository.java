package com.hostel.authz.repository;

import com.hostel.authz.entity.RoomAllocation;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RoomAllocationRepository extends MongoRepository<RoomAllocation, String> {
    Optional<RoomAllocation> findByStudentIdAndStatus(String studentId, String status);
    List<RoomAllocation> findByRoomIdAndStatus(String roomId, String status);
}

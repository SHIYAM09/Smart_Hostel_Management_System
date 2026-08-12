package com.hostel.authz.repository;

import com.hostel.authz.entity.Room;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RoomRepository extends MongoRepository<Room, String> {
    Optional<Room> findByRoomNumber(String roomNumber);
    List<Room> findByHostelBlock(String hostelBlock);
    List<Room> findByStatus(String status);
}

package com.hostel.authz.service;

import com.hostel.authz.entity.Room;
import com.hostel.authz.entity.Student;
import com.hostel.authz.repository.RoomRepository;
import com.hostel.authz.repository.StudentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DatabaseSanitizer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DatabaseSanitizer.class);

    private final RoomRepository roomRepository;
    private final StudentRepository studentRepository;
    private final com.hostel.authz.repository.FoodWastageRepository foodWastageRepository;

    public DatabaseSanitizer(RoomRepository roomRepository, StudentRepository studentRepository, com.hostel.authz.repository.FoodWastageRepository foodWastageRepository) {
        this.roomRepository = roomRepository;
        this.studentRepository = studentRepository;
        this.foodWastageRepository = foodWastageRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        log.info("Running DatabaseSanitizer to fix room blocks, student blocks, room occupancy, and purge mock food wastage...");

        List<com.hostel.authz.entity.FoodWastage> wastageLogs = foodWastageRepository.findAll();
        List<String> mockRemarks = List.of(
            "Normal routine", "Slight rice surplus", "Special lunch menu", 
            "Optimal portioning", "Feast day wastage", "Weekend outing", "Sunday menu"
        );
        for (com.hostel.authz.entity.FoodWastage fw : wastageLogs) {
            if (fw.getRemarks() != null && mockRemarks.contains(fw.getRemarks().trim())) {
                foodWastageRepository.delete(fw);
                log.info("Sanitized & removed mock FoodWastage record ID: {}, remark: {}", fw.getId(), fw.getRemarks());
            }
        }

        List<Student> students = studentRepository.findAll();
        for (Student s : students) {
            String rm = s.getRoomNumber() != null ? s.getRoomNumber().trim().toUpperCase() : "";
            String targetBlock = resolveBlock(rm, s.getHostelBlock());
            if (!targetBlock.equalsIgnoreCase(s.getHostelBlock())) {
                s.setHostelBlock(targetBlock);
                studentRepository.save(s);
                log.info("Sanitized Student {} ({}) block -> {}", s.getFullName(), rm, targetBlock);
            }
        }

        List<Room> rooms = roomRepository.findAll();
        for (Room r : rooms) {
            String rm = r.getRoomNumber() != null ? r.getRoomNumber().trim().toUpperCase() : "";
            String targetBlock = resolveBlock(rm, r.getHostelBlock());
            
            long count = students.stream()
                    .filter(s -> s.getRoomNumber() != null && s.getRoomNumber().trim().equalsIgnoreCase(rm) && !"INACTIVE".equalsIgnoreCase(s.getStatus()))
                    .count();
            
            int capacity = r.getCapacity() != null ? r.getCapacity() : 2;
            int occupied = (int) count;
            String status = r.getStatus();
            if (status == null || !"MAINTENANCE".equalsIgnoreCase(status)) {
                if (occupied >= capacity) {
                    status = "FULL";
                } else if (occupied > 0) {
                    status = "OCCUPIED";
                } else {
                    status = "VACANT";
                }
            }

            boolean needsSave = false;
            if (!targetBlock.equalsIgnoreCase(r.getHostelBlock())) {
                r.setHostelBlock(targetBlock);
                needsSave = true;
            }
            if (r.getOccupiedBeds() == null || r.getOccupiedBeds() != occupied) {
                r.setOccupiedBeds(occupied);
                needsSave = true;
            }
            if (!status.equalsIgnoreCase(r.getStatus())) {
                r.setStatus(status);
                needsSave = true;
            }

            if (needsSave) {
                roomRepository.save(r);
                log.info("Sanitized Room {} -> block: {}, occupied: {}, status: {}", rm, targetBlock, occupied, status);
            }
        }
    }

    private String resolveBlock(String roomNumber, String defaultBlock) {
        if (roomNumber != null && !roomNumber.isBlank()) {
            String u = roomNumber.trim().toUpperCase();
            if (u.startsWith("D-") || u.startsWith("D")) return "Block D";
            if (u.startsWith("A-") || u.startsWith("A")) return "Block A";
            if (u.startsWith("B-") || u.startsWith("B")) return "Block B";
            if (u.startsWith("C-") || u.startsWith("C")) return "Block C";
        }
        if (defaultBlock == null || defaultBlock.isBlank() || "Block A".equalsIgnoreCase(defaultBlock) || "unassigned".equalsIgnoreCase(defaultBlock)) {
            return "Block D";
        }
        return defaultBlock;
    }
}

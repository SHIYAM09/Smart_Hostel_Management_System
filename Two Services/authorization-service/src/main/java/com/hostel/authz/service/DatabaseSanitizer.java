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

import com.hostel.authz.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DatabaseSanitizer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DatabaseSanitizer.class);

    private final RoomRepository roomRepository;
    private final StudentRepository studentRepository;
    private final com.hostel.authz.repository.FoodWastageRepository foodWastageRepository;
    private final UserRepository userRepository;

    public DatabaseSanitizer(RoomRepository roomRepository, 
                             StudentRepository studentRepository, 
                             com.hostel.authz.repository.FoodWastageRepository foodWastageRepository,
                             @Autowired(required = false) UserRepository userRepository) {
        this.roomRepository = roomRepository;
        this.studentRepository = studentRepository;
        this.foodWastageRepository = foodWastageRepository;
        this.userRepository = userRepository;
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
            boolean isDummy = (s.getEmail() == null || s.getEmail().isBlank()) &&
                              (s.getPhone() == null || s.getPhone().isBlank()) &&
                              "Unassigned".equalsIgnoreCase(s.getHostelBlock()) &&
                              "Unassigned".equalsIgnoreCase(s.getRoomNumber());
            
            if (isDummy) {
                boolean hasRealStudent = students.stream().anyMatch(other -> 
                    !other.getId().equals(s.getId()) && 
                    ((other.getEmail() != null && !other.getEmail().isBlank()) || (other.getPhone() != null && !other.getPhone().isBlank()))
                );
                if (hasRealStudent) {
                    studentRepository.delete(s);
                    log.info("Sanitized & purged duplicate dummy Student record ID: {}, name: {}", s.getId(), s.getFullName());
                    continue;
                }
            }

            if (s.getRollNumber() != null && !s.getRollNumber().isBlank()) {
                s.setRollNumber("");
                studentRepository.save(s);
                log.info("Sanitized Student {} -> cleared rollNumber", s.getFullName());
            }

            String rm = s.getRoomNumber() != null ? s.getRoomNumber().trim().toUpperCase() : "";
            String targetBlock = resolveBlock(rm, s.getHostelBlock());
            if (!targetBlock.equalsIgnoreCase(s.getHostelBlock())) {
                s.setHostelBlock(targetBlock);
                studentRepository.save(s);
                log.info("Sanitized Student {} ({}) block -> {}", s.getFullName(), rm, targetBlock);
            }
        }

        if (userRepository != null) {
            try {
                org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder encoder = new org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder();

                if (userRepository.findByUsername("admin").isEmpty()) {
                    com.hostel.authz.entity.User adminUser = com.hostel.authz.entity.User.builder()
                            .username("admin")
                            .email("admin@smart-hostel.com")
                            .password(encoder.encode("admin123"))
                            .fullName("System Administrator")
                            .phone("9999999999")
                            .active(true)
                            .roles(java.util.Set.of(com.hostel.authz.entity.Role.builder().id("ROLE_ADMIN").name("ROLE_ADMIN").build()))
                            .build();
                    userRepository.save(adminUser);
                    log.info("Seeded default system admin user into MongoDB users collection");
                }

                if (userRepository.findByUsername("warden").isEmpty()) {
                    com.hostel.authz.entity.User wardenUser = com.hostel.authz.entity.User.builder()
                            .username("warden")
                            .email("warden@smart-hostel.com")
                            .password(encoder.encode("warden123"))
                            .fullName("John Warden (Block D)")
                            .phone("8888888888")
                            .active(true)
                            .roles(java.util.Set.of(com.hostel.authz.entity.Role.builder().id("ROLE_WARDEN").name("ROLE_WARDEN").build()))
                            .build();
                    userRepository.save(wardenUser);
                    log.info("Seeded default system warden user into MongoDB users collection");
                }

                List<com.hostel.authz.entity.User> users = userRepository.findAll();
                for (com.hostel.authz.entity.User u : users) {
                    boolean dirty = false;
                    java.util.Set<com.hostel.authz.entity.Role> updatedRoles = new java.util.HashSet<>();
                    if (u.getRoles() == null || u.getRoles().isEmpty()) {
                        updatedRoles.add(com.hostel.authz.entity.Role.builder().id("ROLE_STUDENT").name("ROLE_STUDENT").build());
                        dirty = true;
                    } else {
                        for (com.hostel.authz.entity.Role r : u.getRoles()) {
                            String rName = (r != null && r.getName() != null && !r.getName().isBlank()) ? r.getName() : "ROLE_STUDENT";
                            String rId = (r != null && r.getId() != null && !r.getId().isBlank()) ? r.getId() : rName;
                            if (r == null || r.getId() == null || r.getName() == null) {
                                dirty = true;
                            }
                            updatedRoles.add(com.hostel.authz.entity.Role.builder().id(rId).name(rName).build());
                        }
                    }
                    if (dirty) {
                        u.setRoles(updatedRoles);
                        userRepository.save(u);
                        log.info("Sanitized User {} roles -> {}", u.getUsername(), updatedRoles);
                    }
                }
            } catch (Exception e) {
                log.warn("DatabaseSanitizer user roles sanitization skipped: {}", e.getMessage());
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

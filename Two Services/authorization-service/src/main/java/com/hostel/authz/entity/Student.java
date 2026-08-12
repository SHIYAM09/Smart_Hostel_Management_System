package com.hostel.authz.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "students")
public class Student {

    @Id
    private String id;

    private Long userId;
    private String fullName;
    private String rollNumber;
    private String department;
    private Integer yearOfStudy;
    private String hostelBlock;
    private String roomNumber;
    private String guardianName;
    private String guardianPhone;
    private String phone;
    private String email;
    private String status;
    private Integer absenceStreak;
}

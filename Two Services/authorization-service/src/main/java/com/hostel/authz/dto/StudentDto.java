package com.hostel.authz.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentDto {

    private Object id;
    private Long userId;
    private String rollNumber;
    private String fullName;
    private String email;
    private String phone;
    private String department;
    private Integer yearOfStudy;
    private String hostelBlock;
    private String roomNumber;
    private String guardianName;
    private String guardianPhone;
    private String status;
}

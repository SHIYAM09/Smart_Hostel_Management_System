package com.hostel.authz.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateStudentRequest {

    private Long userId;

    @NotBlank(message = "Roll number is required")
    private String rollNumber;

    @NotBlank(message = "Full name is required")
    private String fullName;

    private String department;

    @Positive(message = "Year of study must be a positive number")
    private Integer yearOfStudy;

    private String hostelBlock;
    private String roomNumber;
    private String guardianName;
    private String guardianPhone;
    private String status;
}

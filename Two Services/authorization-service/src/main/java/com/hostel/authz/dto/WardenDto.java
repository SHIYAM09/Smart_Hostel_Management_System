package com.hostel.authz.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WardenDto {

    private Object id;
    private Long userId;
    private String username;
    private String fullName;
    private String name; // Alias for fullName
    private String email;
    private String phone;
    private String hostelBlock;
    private String block; // Alias for hostelBlock
    private String officePhone;
    private String status;
    private Integer studentsManaged;
    private String joinedDate;
}

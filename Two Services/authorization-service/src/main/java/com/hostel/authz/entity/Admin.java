package com.hostel.authz.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "admins")
public class Admin {

    @Id
    private String id;

    private Long userId;
    private String username;
    private String fullName;
    private String department;
    private String phone;
    private String email;
    private String employeeId;
}

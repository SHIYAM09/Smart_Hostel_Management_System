package com.hostel.authz.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "wardens")
public class Warden {

    @Id
    private String id;

    private Long userId;
    private String username;
    private String fullName;
    private String hostelBlock;
    private String phone;
    private String officePhone;
    private String email;
    private String status;
    private Integer studentsManaged;
}

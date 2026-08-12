package com.hostel.authz.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "hostel_blocks")
public class HostelBlock {

    @Id
    private String id;

    private String name;
    private String type; // Boys, Girls, Mixed
    private Integer floors;
    private Integer rooms;
    private Integer occupied;
    private Integer students;
    private String warden;
}

package com.hostel.authz.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "room_allocations")
public class RoomAllocation {

    @Id
    private String id;

    private String studentId;
    private String roomId;
    private LocalDateTime allocatedAt;
    private LocalDateTime vacatedAt;
    private String status;
}

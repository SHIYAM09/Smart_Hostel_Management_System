package com.hostel.authz.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "rooms")
@CompoundIndexes({
    @CompoundIndex(name = "block_room_idx", def = "{'hostelBlock': 1, 'roomNumber': 1}", unique = true)
})
public class Room {

    @Id
    private String id;

    private String roomNumber;
    private String hostelBlock;
    private Integer floor;
    private Integer capacity;
    private Integer occupiedBeds;
    private String status;
    private String condition;
    private String roomType;
}

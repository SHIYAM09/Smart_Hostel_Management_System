package com.hostel.authz.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoomDto {

    private Long id;
    private String roomNumber;
    private String hostelBlock;
    private Integer capacity;
    private Integer occupiedBeds;
    private String status;
}

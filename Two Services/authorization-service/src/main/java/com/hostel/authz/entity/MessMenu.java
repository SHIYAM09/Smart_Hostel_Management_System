package com.hostel.authz.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "mess_menu")
public class MessMenu {

    @Id
    private String id;

    private String dayOfWeek;
    private String breakfast;
    private String lunch;
    private String snacks;
    private String dinner;
    private String specialItem;
    private String notes;
}

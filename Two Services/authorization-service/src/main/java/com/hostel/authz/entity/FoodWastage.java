package com.hostel.authz.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "food_wastage")
public class FoodWastage {

    @Id
    private String id;

    private Double wastageKg;
    private Double breakfastWastage;
    private Double lunchWastage;
    private Double dinnerWastage;
    private Double overallRating;
    private LocalDate logDate;
    private String remarks;
}

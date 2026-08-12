package com.hostel.authz.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "utilities")
public class UtilityMonitoring {

    @Id
    private String id;

    private String hostelBlock;
    private Double electricityUsage;
    private Double waterUsage;
    private Double internetUsage;
    private Double generatorUsage;
    private Double maintenanceCost;
    private LocalDate readingDate;
    private String remarks;
}

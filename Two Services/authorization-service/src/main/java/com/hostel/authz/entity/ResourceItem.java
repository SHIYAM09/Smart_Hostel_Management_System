package com.hostel.authz.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "resources")
public class ResourceItem {

    @Id
    private String id;

    private String name;
    private String unit;
    private Double current;
    private Double threshold;
    private Double max;
    private String trend;
    private Boolean anomaly;
    private String hostelBlock;
    private String status;
}

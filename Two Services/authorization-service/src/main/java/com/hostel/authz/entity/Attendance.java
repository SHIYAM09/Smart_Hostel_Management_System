package com.hostel.authz.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "attendance")
@CompoundIndexes({
    @CompoundIndex(name = "student_date_idx", def = "{'studentId': 1, 'attendanceDate': -1}")
})
public class Attendance {

    @Id
    private String id;

    private String studentId;
    private String studentName;
    private String rollNumber;
    private String roomNumber;
    private LocalDate attendanceDate;
    private String status; // PRESENT, ABSENT, LATE
    private String time;
    private String remarks;
}

package lk.ijse.gdse.back_end.dto;

import lk.ijse.gdse.back_end.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class VetAppointmentDTO {
    private Long vetAppointmentId;
    private String ownerName;
    private String ownerContactNumber;
    private String petName;
    private String serviceType;
    private LocalDateTime appointmentDateTime;
    private String notes;
    private Long userId;
}

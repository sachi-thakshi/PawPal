package lk.ijse.gdse.back_end.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "vet_appointments")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class VetAppointment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long vetAppointmentId;
    private String ownerName;
    private String ownerContactNumber;
    private String petName;
    private String serviceType;
    private LocalDateTime appointmentDateTime;
    private String notes;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    @JsonManagedReference
    private User owner;

}

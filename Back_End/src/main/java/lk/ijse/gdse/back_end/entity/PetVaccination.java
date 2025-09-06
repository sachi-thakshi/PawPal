package lk.ijse.gdse.back_end.entity;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PetVaccination {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long petVaccinationId;
    private String vaccineName;
    private LocalDate dateGiven;
    private LocalDate dueDate;

    @ManyToOne
    @JoinColumn(name = "pet_id")
    @JsonManagedReference
    private Pet pet;
}

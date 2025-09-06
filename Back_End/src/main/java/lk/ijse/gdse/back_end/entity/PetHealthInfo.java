package lk.ijse.gdse.back_end.entity;


import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PetHealthInfo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long petHealthInfoId;

    private String veterinarian;
    private String medicalNotes;

    @OneToOne
    @JoinColumn(name = "pet_id")
    @JsonManagedReference
    private Pet pet;
}

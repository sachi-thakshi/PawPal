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
public class PetCareInfo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long petCareInfoId;

    private String food;
    private String routine;

    @OneToOne
    @JoinColumn(name = "pet_id")
    @JsonManagedReference
    private Pet pet;
}

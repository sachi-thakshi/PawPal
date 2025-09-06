package lk.ijse.gdse.back_end.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "pet_adoptions")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PetAdoption {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long petAdoptionId;

    @Column(nullable = true)
    private String petName;
    private String type;
    private String breed;
    private String age;
    private String gender;
    private String location;
    private String description;

    @Column(name = "adopted_pet_img", nullable = true)
    private String petImage;
    private LocalDate date;
}

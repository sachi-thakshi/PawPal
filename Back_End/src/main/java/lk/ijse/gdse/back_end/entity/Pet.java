package lk.ijse.gdse.back_end.entity;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Pet {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long petId;

    private String name;
    private String type;
    private String breed;
    private String age;
    @Column(name = "pet_profile_image", nullable = true)
    private String petProfileImage;

    @Column(name = "pet_profile_public_id", nullable = true)
    private String publicId;

    @ManyToOne
    @JsonManagedReference
    @JoinColumn(name = "user_id")
    private User owner;

    @OneToOne(mappedBy = "pet", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private PetHealthInfo petHealthInfo;

    @OneToOne(mappedBy = "pet", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private PetCareInfo petCareInfo;

    @OneToMany(mappedBy = "pet", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<PetVaccination> vaccinations;

}

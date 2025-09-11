package lk.ijse.gdse.back_end.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "adoption_requests")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AdoptionRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long requestId;

    @ManyToOne
    @JoinColumn(name = "pet_id", nullable = false)
    private PetAdoption pet;

    @ManyToOne
    @JoinColumn(name = "requester_id", nullable = false)
    private User requester;

    private boolean approved = false;

    private LocalDateTime requestDate = LocalDateTime.now();
}

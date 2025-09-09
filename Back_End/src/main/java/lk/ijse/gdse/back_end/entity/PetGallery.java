package lk.ijse.gdse.back_end.entity;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PetGallery {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long petGalleryId;

    private String imageUrl;
    private String description;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private String publicId;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = true)
    @JsonManagedReference
    private User submittedBy;
}

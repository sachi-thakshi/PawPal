package lk.ijse.gdse.back_end.entity;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "pet_reports")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PetReport {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long reportId;

    private String petName;
    private String description;
    private String location;
    private String imageUrl;

    @Enumerated(EnumType.STRING)
    private PetReportType type; // LOST or FOUND

    private LocalDateTime reportedAt;

    @Column(name = "image_public_id", nullable = true)
    private String publicId;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    @JsonManagedReference
    private User owner;
}

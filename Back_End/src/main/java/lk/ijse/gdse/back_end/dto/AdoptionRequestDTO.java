package lk.ijse.gdse.back_end.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdoptionRequestDTO {
    private Long requestId;
    private Boolean approved;
    private LocalDateTime requestDate;

    // requester info
    private Long requesterId;
    private String requesterName;
    private String requesterEmail;

    // pet info
    private Long petId;
    private String petName;
    private String petType;
    private String petImage;
    private String petLocation;

    private String ownerUsername;
    private String ownerEmail;

}

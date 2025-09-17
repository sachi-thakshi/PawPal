package lk.ijse.gdse.back_end.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PetAdoptionDTO {
    private Long petAdoptionId;
    private String petName;
    private String type;
    private String breed;
    private String age;
    private String gender;
    private String location;
    private String description;
    private String petImage;
    private String ownerUsername;
    private String ownerEmail;

    private boolean hasApprovedRequest;
    private boolean hasPendingRequest;

    private LocalDate date;
}

package lk.ijse.gdse.back_end.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdoptionRequestDTO {
    private Long requestId;
    private Long petId;
    private String petName;
    private String requesterUsername;
    private String requesterEmail;
    private boolean approved;
}

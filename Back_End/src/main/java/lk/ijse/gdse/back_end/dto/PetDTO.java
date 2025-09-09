package lk.ijse.gdse.back_end.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PetDTO {
    private Long petId;
    private String name;
    private String type;
    private String breed;
    private String age;
    private String petProfileImage;

        private String ownerName;
    private String ownerEmail;
}

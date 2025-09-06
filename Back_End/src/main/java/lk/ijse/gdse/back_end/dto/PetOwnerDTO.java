package lk.ijse.gdse.back_end.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PetOwnerDTO {
    private String username;
    private String email;
    private String contactNumber;
    private String address;
    private String password;
    private String profileImageUrl; // store the path or URL of the uploaded photo
}

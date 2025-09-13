package lk.ijse.gdse.back_end.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Builder
@Data
@AllArgsConstructor
@NoArgsConstructor
public class PetItemDTO {
    private Long petItemId;
    private String petItemName;
    private String petItemCategory;
    private double petItemPrice;
    private int quantity;
    private String petItemDescription;
    private String petItemImageUrl;
}

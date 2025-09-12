package lk.ijse.gdse.back_end.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PetItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long petItemId;

    private String petItemName;
    private String petItemDescription;
    private String petItemType; // E.g., Food, Toy, Accessory, etc.
    private double petItemPrice;
    private String petType;
    private String petItemImageUrl;
    private int stock;
}

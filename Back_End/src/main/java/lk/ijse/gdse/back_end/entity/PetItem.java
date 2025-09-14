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
    private String petItemCategory;
    private double petItemPrice;
    private int quantity;
    private String petItemDescription;
    private String petItemImageUrl;
    private String publicId;

    @ManyToOne
    @JoinColumn(name = "order_id", referencedColumnName = "id")
    private Order order;
}

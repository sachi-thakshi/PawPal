package lk.ijse.gdse.back_end.dto;

import lombok.Data;

@Data
public class OrderItemRequestDTO {
    private Long productId;
    private int quantity;
    private double price;
}

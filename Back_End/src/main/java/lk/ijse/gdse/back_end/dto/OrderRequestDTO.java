package lk.ijse.gdse.back_end.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class OrderRequestDTO {
    private String customerName;
    private String customerAddress;
    private String paymentMethod;
    private String customerEmail;
    private List<OrderItemRequestDTO> items;
}

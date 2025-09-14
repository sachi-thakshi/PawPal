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
    private String orderId;
    private String customerName;
    private String address;
    private String paymentMethod;
    private Double totalAmount;
    private List<PetItemDTO> items;
}

package lk.ijse.gdse.back_end.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class OrderHistoryResponseDTO {
    private Long orderId;
    private String customerName;
    private String customerAddress;
    private String paymentMethod;
    private Double total;
    private LocalDateTime createdAt;
    private List<OrderItemResponseDTO> items;
}

package lk.ijse.gdse.back_end.service;

import lk.ijse.gdse.back_end.dto.OrderHistoryResponseDTO;
import lk.ijse.gdse.back_end.dto.OrderRequestDTO;
import lk.ijse.gdse.back_end.dto.OrderResponseDTO;

import java.util.List;

public interface OrderService {
    OrderResponseDTO placeOrder(OrderRequestDTO request, Long userId);
    List<OrderHistoryResponseDTO> getUserOrders(Long userId);
}

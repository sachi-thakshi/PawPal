package lk.ijse.gdse.back_end.service;

import lk.ijse.gdse.back_end.dto.OrderRequestDTO;
import lk.ijse.gdse.back_end.entity.Order;

public interface OrderService {
    Order saveOrder(OrderRequestDTO dto);
    void updateStatus(String orderId, String status);
}

package lk.ijse.gdse.back_end.service;

import jakarta.mail.MessagingException;
import lk.ijse.gdse.back_end.dto.OrderHistoryResponseDTO;
import lk.ijse.gdse.back_end.dto.OrderRequestDTO;
import lk.ijse.gdse.back_end.dto.OrderResponseDTO;

import java.util.List;
import java.util.Map;

public interface OrderService {
    OrderResponseDTO placeOrder(OrderRequestDTO request, Long userId) throws MessagingException;
    List<OrderHistoryResponseDTO> getUserOrders(Long userId);
    double getTodayIncome();
    Map<String, Integer> getShopPerformanceThisWeek();
}

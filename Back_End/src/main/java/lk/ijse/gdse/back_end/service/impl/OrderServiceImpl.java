package lk.ijse.gdse.back_end.service.impl;

import jakarta.mail.MessagingException;
import lk.ijse.gdse.back_end.dto.*;
import lk.ijse.gdse.back_end.entity.*;
import lk.ijse.gdse.back_end.repository.*;
import lk.ijse.gdse.back_end.service.EmailService;
import lk.ijse.gdse.back_end.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final OrderDetailRepository orderDetailRepository;
    private final PetItemRepository petItemRepository;
    private final EmailService emailService;

    @Override
    @Transactional
    public OrderResponseDTO placeOrder(OrderRequestDTO request, Long userId) throws MessagingException {
        double total = 0.0;

        Order order = Order.builder()
                .customerName(request.getCustomerName())
                .customerAddress(request.getCustomerAddress())
                .customerEmail(request.getCustomerEmail())
                .paymentMethod(request.getPaymentMethod())
                .userId(userId)
                .createdAt(LocalDateTime.now())
                .build();

        List<OrderDetail> details = new ArrayList<>();

        for (OrderItemRequestDTO itemRequest : request.getItems()) {
            PetItem petItem = petItemRepository.findById(itemRequest.getProductId())
                    .orElseThrow(() -> new RuntimeException("PetItem not found"));

            if (petItem.getQuantity() < itemRequest.getQuantity()) {
                throw new RuntimeException("Not enough stock for " + petItem.getPetItemName());
            }

            // Update stock
            petItem.setQuantity(petItem.getQuantity() - itemRequest.getQuantity());
            petItemRepository.save(petItem);

            double subtotal = itemRequest.getQuantity() * itemRequest.getPrice();
            total += subtotal;

            OrderDetail detail = OrderDetail.builder()
                    .order(order)
                    .petItem(petItem)
                    .quantity(itemRequest.getQuantity())
                    .price(itemRequest.getPrice())
                    .subtotal(subtotal)
                    .build();

            details.add(detail);
        }

        order.setTotal(total);
        order.setOrderDetails(details);

        orderRepository.save(order);

        try {
            emailService.sendOrderInvoice(order);
        } catch (Exception e) {
            System.err.println("Failed to send invoice email: " + e.getMessage());
        }

        return new OrderResponseDTO(order.getId(), "Order placed successfully");
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderHistoryResponseDTO> getUserOrders(Long userId) {
        List<Order> orders = orderRepository.findByUserId(userId);

        return orders.stream().map(order -> {
            List<OrderItemResponseDTO> items = order.getOrderDetails().stream()
                    .map(detail -> new OrderItemResponseDTO(
                            detail.getPetItem().getPetItemId(),
                            detail.getPetItem().getPetItemName(),
                            detail.getQuantity(),
                            detail.getPrice(),
                            detail.getSubtotal()
                    ))
                    .toList();

            return new OrderHistoryResponseDTO(
                    order.getId(),
                    order.getCustomerName(),
                    order.getCustomerAddress(),
                    order.getPaymentMethod(),
                    order.getTotal(),
                    order.getCreatedAt(),
                    items
            );
        }).toList();
    }

    @Override
    public double getTodayIncome() {
        LocalDate today = LocalDate.now();
        // Assuming orderDate is LocalDateTime
        return orderRepository
                .findByCreatedAtBetween(today.atStartOfDay(), today.plusDays(1).atStartOfDay())
                .stream()
                .mapToDouble(order -> order.getTotal())
                .sum();
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Integer> getShopPerformanceThisWeek() {
        LocalDate today = LocalDate.now();
        LocalDate startOfWeek = today.with(java.time.DayOfWeek.MONDAY);
        LocalDate endOfWeek = today.with(java.time.DayOfWeek.SUNDAY);

        List<Order> orders = orderRepository.findByCreatedAtBetween(
                startOfWeek.atStartOfDay(),
                endOfWeek.atTime(23, 59, 59)
        );

        Map<String, Integer> performance = new HashMap<>();
        performance.put("Pet Food", 0);
        performance.put("Toys", 0);
        performance.put("Accessories", 0);
        performance.put("Medicine", 0);
        performance.put("Grooming", 0);

        for (Order order : orders) {
            order.getOrderDetails().forEach(detail -> {
                String category = detail.getPetItem().getPetItemCategory(); // Add category to PetItem entity
                performance.put(category, performance.getOrDefault(category, 0) + detail.getQuantity());
            });
        }

        return performance;
    }
}

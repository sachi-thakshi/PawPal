package lk.ijse.gdse.back_end.service.impl;

import lk.ijse.gdse.back_end.dto.OrderRequestDTO;
import lk.ijse.gdse.back_end.entity.Order;
import lk.ijse.gdse.back_end.entity.PetItem;
import lk.ijse.gdse.back_end.repository.OrderRepository;
import lk.ijse.gdse.back_end.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepo;

    public Order saveOrder(OrderRequestDTO dto) {
        Order order = Order.builder()
                .orderId(dto.getOrderId())
                .customerName(dto.getCustomerName())
                .address(dto.getAddress())
                .paymentMethod(dto.getPaymentMethod())
                .status("PENDING")
                .totalAmount(dto.getTotalAmount())
                .build();

        List<PetItem> items = dto.getItems().stream().map(i -> PetItem.builder()
                .petItemName(i.getPetItemName())
                .petItemCategory(i.getPetItemCategory())
                .petItemPrice(i.getPetItemPrice())
                .quantity(i.getQuantity())
                .petItemDescription(i.getPetItemDescription())
                .petItemImageUrl(i.getPetItemImageUrl())
                .order(order) // link back
                .build()).collect(Collectors.toList());

        order.setItems(items);

        return orderRepo.save(order);
    }

    public void updateStatus(String orderId, String status) {
        orderRepo.findByOrderId(orderId).ifPresent(order -> {
            order.setStatus(status);
            orderRepo.save(order);
        });
    }
}

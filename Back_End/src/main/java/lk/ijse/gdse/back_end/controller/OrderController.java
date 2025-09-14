package lk.ijse.gdse.back_end.controller;

import lk.ijse.gdse.back_end.dto.OrderRequestDTO;
import lk.ijse.gdse.back_end.repository.OrderRepository;
import lk.ijse.gdse.back_end.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class OrderController {
    private final OrderRepository orderRepo;

    private final OrderService orderService;

    @PostMapping
    public ResponseEntity<?> createOrder(@RequestBody OrderRequestDTO dto) {
        var order = orderService.saveOrder(dto);
        return ResponseEntity.ok().body(order.getOrderId());
    }
}

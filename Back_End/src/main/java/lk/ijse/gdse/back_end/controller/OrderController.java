package lk.ijse.gdse.back_end.controller;

import jakarta.mail.MessagingException;
import jakarta.servlet.http.HttpServletRequest;
import lk.ijse.gdse.back_end.dto.OrderHistoryResponseDTO;
import lk.ijse.gdse.back_end.dto.OrderRequestDTO;
import lk.ijse.gdse.back_end.dto.OrderResponseDTO;
import lk.ijse.gdse.back_end.service.OrderService;
import lk.ijse.gdse.back_end.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/orders")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class OrderController {
    private final OrderService orderService;
    private final JwtUtil jwtUtil;

    @PostMapping
    public ResponseEntity<OrderResponseDTO> placeOrder(
            @RequestBody OrderRequestDTO request,
            HttpServletRequest httpRequest) throws MessagingException {

        String authHeader = httpRequest.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401).build();
        }

        String token = authHeader.substring(7);
        Long userId = jwtUtil.extractUserId(token);

        OrderResponseDTO response = orderService.placeOrder(request, userId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/my-orders")
    public ResponseEntity<List<OrderHistoryResponseDTO>> getMyOrders(HttpServletRequest httpRequest) {
        String authHeader = httpRequest.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401).build();
        }

        String token = authHeader.substring(7);
        Long userId = jwtUtil.extractUserId(token);

        List<OrderHistoryResponseDTO> orders = orderService.getUserOrders(userId);
        return ResponseEntity.ok(orders);
    }
}

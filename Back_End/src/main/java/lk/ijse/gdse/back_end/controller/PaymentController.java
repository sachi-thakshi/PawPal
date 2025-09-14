package lk.ijse.gdse.back_end.controller;

import org.springframework.ui.Model;
import jakarta.servlet.http.HttpServletRequest;
import lk.ijse.gdse.back_end.dto.PaymentRequestDTO;
import lk.ijse.gdse.back_end.service.PayHereService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/payment")
@RequiredArgsConstructor
public class PaymentController {

    private final PayHereService payHereService;

    @GetMapping("/checkout")
    public String checkout() {
        return "checkout";
    }

    @PostMapping("/process")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> processPayment(@RequestBody PaymentRequestDTO request) {
        // This is the method: processPayment
        // It handles POST requests to: /payment/process

        try {
            // Set orderId if not provided
            if (request.getOrderId() == null || request.getOrderId().isEmpty()) {
                request.setOrderId("ORDER_" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
            }

            Map<String, String> paymentData = payHereService.generatePaymentData(request);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("paymentData", paymentData);

            String paymentUrl = "sandbox".equalsIgnoreCase(payHereService.getMode())
                    ? payHereService.getSandboxPaymentUrl()
                    : payHereService.getLivePaymentUrl();

            response.put("paymentUrl", paymentUrl);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            // Log the full stack trace
            e.printStackTrace();

            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/notify")
    @ResponseBody
    public ResponseEntity<String> paymentNotify(HttpServletRequest request) {
        Map<String, String> params = new HashMap<>();
        request.getParameterMap().forEach((key, value) -> {
            if (value != null && value.length > 0) {
                params.put(key, value[0]);
            }
        });

        if (payHereService.verifyPayment(params)) {
            // Payment verified - update your database
            String orderId = params.get("order_id");
            String paymentId = params.get("payment_id");
            String statusCode = params.get("status_code");

            // Handle payment status
            if ("2".equals(statusCode)) {
                // Payment successful
                System.out.println("Payment successful for order: " + orderId);
                // Update order status in database
            } else {
                // Payment failed or pending
                System.out.println("Payment failed/pending for order: " + orderId);
            }

            return ResponseEntity.ok("OK");
        } else {
            return ResponseEntity.badRequest().body("Invalid hash");
        }
    }

    @GetMapping("/return")
    public String paymentReturn(@RequestParam Map<String, String> params, Model model) {
        String orderId = params.get("order_id");
        String paymentId = params.get("payment_id");

        model.addAttribute("orderId", orderId);
        model.addAttribute("paymentId", paymentId);

        return "payment-success";
    }

    @GetMapping("/cancel")
    public String paymentCancel(@RequestParam Map<String, String> params, Model model) {
        String orderId = params.get("order_id");
        model.addAttribute("orderId", orderId);
        return "payment-cancel";
    }

    @GetMapping("/health")
    public ResponseEntity<String> healthCheck() {
        System.out.println("Health check endpoint called!");
        return ResponseEntity.ok("PayHere Payment Service is running");
    }
}

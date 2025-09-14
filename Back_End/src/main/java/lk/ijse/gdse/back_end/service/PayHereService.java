package lk.ijse.gdse.back_end.service;

import jakarta.annotation.PostConstruct;
import lk.ijse.gdse.back_end.config.PayHereConfig;
import lk.ijse.gdse.back_end.dto.PaymentRequestDTO;
import lombok.RequiredArgsConstructor;
import org.apache.commons.codec.digest.DigestUtils;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.text.DecimalFormat;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PayHereService {
    private final PayHereConfig payHereConfig;

    public Map<String, String> generatePaymentData(PaymentRequestDTO request) {
        Map<String, String> paymentData = new HashMap<>();

        // Format amount to 2 decimal places
        DecimalFormat df = new DecimalFormat("0.00");
        String formattedAmount = df.format(request.getAmount());

        // Basic payment data
        paymentData.put("merchant_id", payHereConfig.getMerchantId());
        paymentData.put("return_url", payHereConfig.getReturnUrl());
        paymentData.put("cancel_url", payHereConfig.getCancelUrl());
        paymentData.put("notify_url", payHereConfig.getNotifyUrl());
        paymentData.put("order_id", request.getOrderId());
        paymentData.put("items", request.getItemDescription());
        paymentData.put("currency", request.getCurrency());
        paymentData.put("amount", formattedAmount);

        // Customer data
        paymentData.put("first_name", request.getFirstName());
        paymentData.put("last_name", request.getLastName());
        paymentData.put("email", request.getEmail());
        paymentData.put("phone", request.getPhone());
        paymentData.put("address", request.getAddress());
        paymentData.put("city", request.getCity());
        paymentData.put("country", request.getCountry());

        // Generate hash
        String hash = generateHash(request.getOrderId(), formattedAmount, request.getCurrency());
        paymentData.put("hash", hash);

        return paymentData;
    }

    private String generateHash(String orderId, String amount, String currency) {
        String merchantId = payHereConfig.getMerchantId();
        String merchantSecretMd5 = DigestUtils.md5Hex(payHereConfig.getMerchantSecret()).toUpperCase();

        String hashString = merchantId + orderId + amount + currency + merchantSecretMd5;
        return DigestUtils.md5Hex(hashString).toUpperCase();
    }

    public boolean verifyPayment(Map<String, String> params) {
        String receivedHash = params.get("md5sig");
        String orderId = params.get("order_id");
        String paymentId = params.get("payment_id");
        String amount = params.get("payhere_amount");
        String currency = params.get("payhere_currency");
        String statusCode = params.get("status_code");

        String localHash = generateNotifyHash(orderId, paymentId, amount, currency, statusCode);

        return receivedHash != null && receivedHash.equals(localHash);
    }

    private String generateNotifyHash(String orderId, String payherePaymentId, String amount,
                                      String currency, String statusCode) {
        String merchantId = payHereConfig.getMerchantId();
        String merchantSecretMd5 = DigestUtils.md5Hex(payHereConfig.getMerchantSecret()).toUpperCase();

        // Required order for notify hash
        String hashString = merchantId + orderId + payherePaymentId + amount + currency + statusCode + merchantSecretMd5;
        return DigestUtils.md5Hex(hashString).toUpperCase();
    }

    @PostConstruct
    public void validateConfig() {
        if (payHereConfig.getMerchantId() == null || payHereConfig.getMerchantSecret() == null) {
                throw new IllegalStateException("PayHereConfig properties are not set correctly!");
        }
    }

    public String getSandboxPaymentUrl() {
        return payHereConfig.getSandboxUrl() + "/pay/checkout";
    }

    public String getLivePaymentUrl() {
        return payHereConfig.getLiveUrl() + "/pay/checkout";
    }

    public String getMode() {
        return payHereConfig.getMode();
    }
}

package lk.ijse.gdse.back_end.service;

import jakarta.mail.MessagingException;
import lk.ijse.gdse.back_end.entity.Order;

public interface EmailService {
    void sendEmail(String to, String subject, String body, String replyTo);
    void sendOtpEmail(String to, String otp);
    void sendOrderInvoice(Order order)throws MessagingException;
}

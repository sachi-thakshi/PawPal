package lk.ijse.gdse.back_end.service;

public interface EmailService {
    void sendEmail(String to, String subject, String body, String replyTo);
    void sendOtpEmail(String to, String otp);
}

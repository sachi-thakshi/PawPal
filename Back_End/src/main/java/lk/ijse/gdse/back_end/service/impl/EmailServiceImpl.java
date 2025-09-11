package lk.ijse.gdse.back_end.service.impl;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lk.ijse.gdse.back_end.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    @Override
    public void sendEmail(String to, String subject, String body, String replyTo) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);

            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(body, true); // HTML content
            helper.setFrom(replyTo);
            helper.setReplyTo(replyTo);

            mailSender.send(message);
            log.info("Email successfully sent to {}", to);

        } catch (MessagingException ex) {
            log.error("Messaging error: {}", ex.getMessage(), ex);
            throw new RuntimeException("Messaging error: " + ex.getMessage(), ex);
        } catch (Exception ex) {
            log.error("Unexpected error while sending email: {}", ex.getMessage(), ex);
            throw new RuntimeException("Unexpected error while sending email: " + ex.getMessage(), ex);
        }
    }
}
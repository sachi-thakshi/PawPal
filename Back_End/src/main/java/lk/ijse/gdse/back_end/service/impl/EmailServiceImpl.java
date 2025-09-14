package lk.ijse.gdse.back_end.service.impl;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lk.ijse.gdse.back_end.entity.Order;
import lk.ijse.gdse.back_end.entity.OrderDetail;
import lk.ijse.gdse.back_end.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
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

    @Override
    public void sendOtpEmail(String to, String otp) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("PawPal Password Reset OTP");
        message.setText("Hello,\n\nYour OTP for password reset is: " + otp +
                "\nIt will expire in 5 minutes.\n\nThank you,\nPawPal Team");

        mailSender.send(message);
    }

    @Override
    public void sendOrderInvoice(Order order) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(order.getCustomerEmail());
            helper.setSubject("Your PawPal Order Invoice - #" + order.getId());

            StringBuilder itemsTable = new StringBuilder();
            boolean odd = true;
            for (var detail : order.getOrderDetails()) {
                String rowBg = odd ? "#f9f9f9" : "#ffffff";
                itemsTable.append("<tr style='background:").append(rowBg).append(";color:#000;'>")
                        .append("<td style='padding:10px;border:1px solid #003092;'>")
                        .append(detail.getPetItem().getPetItemName())
                        .append("</td>")
                        .append("<td style='padding:10px;border:1px solid #003092;text-align:center;'>")
                        .append(detail.getQuantity())
                        .append("</td>")
                        .append("<td style='padding:10px;border:1px solid #003092;text-align:right;'>LKR ")
                        .append(String.format("%.2f", detail.getSubtotal()))
                        .append("</td>")
                        .append("</tr>");
                odd = !odd;
            }

            String html = "<!DOCTYPE html>"
                    + "<html>"
                    + "<head>"
                    + "<style>"
                    + "body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0; color: #000; }"
                    + ".invoice-box { max-width: 600px; margin: auto; padding: 30px; background: #ffffff; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }"
                    + ".invoice-header { background: #7C4585; color: #ffffff; padding: 15px; text-align: center; border-radius: 8px 8px 0 0; }"
                    + "h2 { margin: 0; }"
                    + "table { width: 100%; border-collapse: collapse; margin-top: 20px; }"
                    + "table th { background: #003092; color: #ffffff; padding: 12px; border: 1px solid #003092; text-align: left; }"
                    + "table td { padding: 10px; border: 1px solid #003092; color: #000; }"
                    + ".total { text-align: right; font-weight: bold; color: #7C4585; padding-top: 15px; font-size: 16px; }"
                    + ".footer { text-align: center; margin-top: 30px; font-size: 14px; color: #003092; }"
                    + "p { color: #000; }"
                    + "</style>"
                    + "</head>"
                    + "<body>"
                    + "<div class='invoice-box'>"
                    + "<div class='invoice-header'><h2>PawPal Pet Store</h2></div>"
                    + "<p>Hello <strong>" + order.getCustomerName() + "</strong>,</p>"
                    + "<p>Thank you for your order! Here’s your invoice:</p>"
                    + "<p><strong>Order ID:</strong> #" + order.getId() + "<br>"
                    + "<strong>Order Date:</strong> " + order.getCreatedAt() + "</p>"
                    + "<table>"
                    + "<thead><tr><th>Item</th><th>Qty</th><th>Subtotal</th></tr></thead>"
                    + "<tbody>"
                    + itemsTable
                    + "</tbody>"
                    + "</table>"
                    + "<p class='total'>Total: LKR " + String.format("%.2f", order.getTotal()) + "</p>"
                    + "<div class='footer'>We hope you enjoy your purchase!<br>PawPal Team</div>"
                    + "</div>"
                    + "</body>"
                    + "</html>";

            helper.setText(html, true); // HTML content
            mailSender.send(message);

        } catch (MessagingException e) {
            e.printStackTrace();
            throw new RuntimeException("Failed to send invoice email");
        }
    }
}
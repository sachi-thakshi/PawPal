package lk.ijse.gdse.back_end.controller;

import lk.ijse.gdse.back_end.service.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class EmailTestController {

    private final EmailService emailService;

    @PostMapping("/api/email/send")
    public String sendTestEmail(
            @RequestParam String to,
            @RequestParam(required = false) String replyTo
    ) {
        String subject = "Gmail SMTP Test";
        String body = "<h3>Hello! 🎉</h3><p>This is a test email sent via Gmail SMTP and Spring Boot.</p>";

        String from = (replyTo != null ? replyTo : "sachiniimbulagoda@gmail.com");
        emailService.sendEmail(to, subject, body, from);

        return "Test email sent successfully to " + to;
    }
}
package lk.ijse.gdse.back_end.controller;

import lk.ijse.gdse.back_end.dto.EmailRequestDTO;
import lk.ijse.gdse.back_end.dto.ResetPasswordRequestDTO;
import lk.ijse.gdse.back_end.entity.User;
import lk.ijse.gdse.back_end.repository.UserRepository;
import lk.ijse.gdse.back_end.service.EmailService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;

@RestController
@RequestMapping("/forgot-password")
public class PasswordResetController {

    private final UserRepository userRepository;
    private final EmailService emailService;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public PasswordResetController(UserRepository userRepository, EmailService emailService) {
        this.userRepository = userRepository;
        this.emailService = emailService;
    }

    // Send OTP
    @PostMapping("/send-otp")
    public ResponseEntity<String> sendOtp(@RequestBody EmailRequestDTO request) {
        Optional<User> optionalUser = userRepository.findByEmail(request.getEmail());
        if (optionalUser.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Email not found");
        }

        User user = optionalUser.get();
        String otp = String.valueOf(new Random().nextInt(900000) + 100000); // 6-digit OTP
        user.setOtp(otp);
        user.setOtpExpiry(LocalDateTime.now().plusMinutes(5));
        userRepository.save(user);

        emailService.sendOtpEmail(user.getEmail(), otp);
        return ResponseEntity.ok("OTP sent successfully");
    }

    // Reset Password
    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@RequestBody ResetPasswordRequestDTO request) {
        Optional<User> optionalUser = userRepository.findByEmail(request.getEmail());
        if (optionalUser.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Email not found");
        }

        User user = optionalUser.get();

        if (user.getOtp() == null ||
                !user.getOtp().equals(request.getOtp()) ||
                user.getOtpExpiry().isBefore(LocalDateTime.now())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid or expired OTP");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setOtp(null);
        user.setOtpExpiry(null);
        userRepository.save(user);

        return ResponseEntity.ok("Password reset successfully");
    }
}

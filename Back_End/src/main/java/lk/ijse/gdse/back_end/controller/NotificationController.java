package lk.ijse.gdse.back_end.controller;

import lk.ijse.gdse.back_end.dto.*;
import lk.ijse.gdse.back_end.service.AdoptionService;
import lk.ijse.gdse.back_end.service.PetReportService;
import lk.ijse.gdse.back_end.service.PetVaccinationService;
import lk.ijse.gdse.back_end.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Stream;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
public class NotificationController {
    private final AdoptionService adoptionService;
    private final PetReportService petReportService;
    private final PetVaccinationService petVaccinationService;
    private final JwtUtil jwtUtil;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getOwnerNotifications(@RequestHeader("Authorization") String authHeader) {
        String ownerEmail = extractEmailFromHeader(authHeader);

        // Latest adoption requests
        List<AdoptionRequestDTO> adoptionRequests = adoptionService.getPendingRequestsForOwner(ownerEmail);
        List<Map<String, String>> adoptionNotifications = adoptionRequests.stream().map(r -> Map.of(
                "type", "ADOPTION",
                "title", "New adoption request",
                "message", String.format("for %s \"%s\" from %s", r.getPetType(), r.getPetName(), r.getRequesterName())
        )).toList();

        // Latest lost & found reports
        List<PetReportDTO> petReports = petReportService.getLatestReportsForOwner(ownerEmail);
        List<Map<String, String>> lostFoundNotifications = petReports.stream().map(r -> Map.of(
                "type", "LOST_FOUND",
                "title", r.getType().equalsIgnoreCase("LOST") ? "Missing pet reported" : "Pet found",
                "message", String.format("%s at %s", r.getPetName(), r.getLocation())
        )).toList();

        // Upcoming vaccinations
        LocalDate today = LocalDate.now();
        List<PetVaccinationDTO> upcomingVaccinations = petVaccinationService.getUpcomingVaccinationsForOwner(ownerEmail, today);
        List<Map<String, String>> vaccinationNotifications = upcomingVaccinations.stream().map(v -> Map.of(
                "type", "VACCINATION",
                "title", "Upcoming vaccination",
                "message", String.format("%s for pet due on %s", v.getVaccineName(), v.getDueDate())
        )).toList();

        // Combine all notifications
        List<Map<String, String>> allNotifications = Stream.of(adoptionNotifications, lostFoundNotifications, vaccinationNotifications)
                .flatMap(List::stream)
                .toList();

        Map<String, Object> response = new HashMap<>();
        response.put("data", allNotifications);

        return ResponseEntity.ok(response);
    }


    // Utility method to extract email from JWT
    private String extractEmailFromHeader(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new RuntimeException("Unauthorized: Missing or invalid token");
        }
        String token = authHeader.substring(7);
        return jwtUtil.extractEmail(token);
    }
}

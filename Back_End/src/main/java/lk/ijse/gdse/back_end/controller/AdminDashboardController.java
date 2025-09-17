package lk.ijse.gdse.back_end.controller;

import lk.ijse.gdse.back_end.dto.AdminDashboardStatsDTO;
import lk.ijse.gdse.back_end.entity.PetReportType;
import lk.ijse.gdse.back_end.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/admin-dashboard")
@RequiredArgsConstructor
@CrossOrigin
public class AdminDashboardController {

    private final AdminDashboardService adminDashboardService;
    private final AdoptionService adoptionService;
    private final PetItemService petItemService;
    private final PetReportService petReportService;

    // ---- Dashboard Stats ----
    @GetMapping("/stats")
    public ResponseEntity<AdminDashboardStatsDTO> getDashboardStats() {
        return ResponseEntity.ok(adminDashboardService.getDashboardStats());
    }

    // ---- Weekly Adoption Chart ----
    @GetMapping("/adoptions-requests-chart-week")
    public Map<String, Object> getWeeklyAdoptionsRequests() {
        return adoptionService.getWeeklyAdoptionsRequests();
    }

    @GetMapping("/shop-categories-count")
    public Map<String, Long> getShopCategoriesCount() {
        return petItemService.getPetItemCountsByCategory();
    }

    @GetMapping("/lost-found-counts")
    public ResponseEntity<Map<String, Long>> getLostFoundCounts() {
        try {
            long lostCount = petReportService.getReportsByType(PetReportType.LOST).size();
            long foundCount = petReportService.getReportsByType(PetReportType.FOUND).size();

            Map<String, Long> counts = Map.of(
                    "lost", lostCount,
                    "found", foundCount
            );

            return ResponseEntity.ok(counts);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }
}

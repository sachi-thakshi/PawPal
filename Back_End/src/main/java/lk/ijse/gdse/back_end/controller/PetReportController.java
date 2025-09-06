package lk.ijse.gdse.back_end.controller;

import lk.ijse.gdse.back_end.dto.ApiResponse;
import lk.ijse.gdse.back_end.dto.PetReportDTO;
import lk.ijse.gdse.back_end.entity.PetReport;
import lk.ijse.gdse.back_end.service.PetReportService;
import lk.ijse.gdse.back_end.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/pet-report")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PetReportController {
    private final PetReportService petReportService;
    private final JwtUtil jwtUtil;

    private String extractEmailFromHeader(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new RuntimeException("Unauthorized: Missing or invalid token");
        }
        String token = authHeader.substring(7);
        return jwtUtil.extractEmail(token);
    }

    // Convert entity to DTO
    private PetReportDTO toDTO(PetReport entity) {
        if (entity == null) return null;

        return PetReportDTO.builder()
                .reportId(entity.getReportId())
                .petName(entity.getPetName())
                .description(entity.getDescription())
                .location(entity.getLocation())
                .type(entity.getType() != null ? entity.getType().name() : null)
                .reportedAt(entity.getReportedAt())
                .imageUrl(entity.getImageUrl())
                .build();
    }

    @PostMapping("/{userId}")
    public ResponseEntity<ApiResponse<PetReportDTO>> createPetReport(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long userId,
            @RequestPart("data") PetReportDTO dto,
            @RequestPart(value = "image", required = false) MultipartFile imageFile) {

        String email = extractEmailFromHeader(authHeader);

        PetReport saved = petReportService.addReport(userId, dto, imageFile);
        PetReportDTO responseDto = toDTO(saved);

        return ResponseEntity.ok(new ApiResponse<>(200, "Pet report created successfully", responseDto));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<List<PetReportDTO>>> getReportsByUser(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long userId) {

        extractEmailFromHeader(authHeader);

        List<PetReportDTO> dtoList = petReportService.getReportsByUser(userId)
                .stream().map(this::toDTO).collect(Collectors.toList());

        return ResponseEntity.ok(new ApiResponse<>(200, "Reports fetched successfully", dtoList));
    }

    // ------------------- GET BY TYPE (LOST or FOUND) -------------------
    @GetMapping("/type/{type}")
    public ResponseEntity<ApiResponse<List<PetReportDTO>>> getReportsByType(@PathVariable String type) {
        List<PetReportDTO> dtoList = petReportService.getReportsByType(type.toUpperCase())
                .stream().map(this::toDTO).collect(Collectors.toList());

        return ResponseEntity.ok(new ApiResponse<>(200, "Reports fetched successfully", dtoList));
    }

    @PutMapping("/{reportId}")
    public ResponseEntity<ApiResponse<PetReportDTO>> updateReport(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long reportId,
            @RequestPart("data") PetReportDTO dto,
            @RequestPart(value = "image", required = false) MultipartFile imageFile) {

        String email = extractEmailFromHeader(authHeader);

        PetReport existing = petReportService.getReportById(reportId);
        if (!existing.getOwner().getEmail().equals(email)) {
            return ResponseEntity.status(403)
                    .body(new ApiResponse<>(403, "Not authorized to update this report", null));
        }

        PetReport updated = petReportService.updateReport(reportId, dto, imageFile);
        PetReportDTO responseDTO = toDTO(updated);

        return ResponseEntity.ok(new ApiResponse<>(200, "Report updated successfully", responseDTO));
    }

    @DeleteMapping("/{reportId}")
    public ResponseEntity<ApiResponse<Void>> deleteReport(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long reportId) {

        String email = extractEmailFromHeader(authHeader);

        PetReport existing = petReportService.getReportById(reportId);
        if (!existing.getOwner().getEmail().equals(email)) {
            return ResponseEntity.status(403)
                    .body(new ApiResponse<>(403, "Not authorized to delete this report", null));
        }

        petReportService.deleteReport(reportId);
        return ResponseEntity.ok(new ApiResponse<>(200, "Report deleted successfully", null));
    }

    @GetMapping("/all")
    public ResponseEntity<ApiResponse<List<PetReportDTO>>> getAllReports() {
        List<PetReportDTO> dtoList = petReportService.getAllReportsSorted()
                .stream().map(this::toDTO).collect(Collectors.toList());

        return ResponseEntity.ok(new ApiResponse<>(200, "All reports fetched successfully", dtoList));
    }

    @GetMapping("/{reportId}")
    public ResponseEntity<ApiResponse<PetReportDTO>> getReportById(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long reportId) {

        extractEmailFromHeader(authHeader);

        PetReport report = petReportService.getReportById(reportId);
        PetReportDTO dto = toDTO(report);

        return ResponseEntity.ok(new ApiResponse<>(200, "Report fetched successfully", dto));
    }
}

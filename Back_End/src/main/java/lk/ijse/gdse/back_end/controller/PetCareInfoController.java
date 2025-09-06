package lk.ijse.gdse.back_end.controller;

import lk.ijse.gdse.back_end.dto.ApiResponse;
import lk.ijse.gdse.back_end.dto.PetCareInfoDTO;
import lk.ijse.gdse.back_end.entity.PetCareInfo;
import lk.ijse.gdse.back_end.service.PetCareInfoService;
import lk.ijse.gdse.back_end.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/petcare")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PetCareInfoController {

    private final PetCareInfoService petCareInfoService;
    private final JwtUtil jwtUtil;

    private String extractEmail(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new RuntimeException("Unauthorized: Missing or invalid token");
        }
        String token = authHeader.substring(7);
        return jwtUtil.extractEmail(token);
    }

    @PostMapping("/{petId}")
    public ResponseEntity<ApiResponse<PetCareInfoDTO>> addOrUpdateCareInfo(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long petId,
            @RequestBody PetCareInfoDTO dto) {

        extractEmail(authHeader); // Validates token

        PetCareInfo saved = petCareInfoService.addOrUpdateCareInfo(petId, dto);
        PetCareInfoDTO responseDTO = toDTO(saved);

        return ResponseEntity.ok(new ApiResponse<>(
                200,
                "Care Info saved",
                responseDTO));
    }

    @GetMapping("/{petId}")
    public ResponseEntity<ApiResponse<PetCareInfoDTO>> getCareInfo(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long petId) {

        extractEmail(authHeader); // Validates token

        PetCareInfo careInfo = petCareInfoService.getCareInfo(petId);
        PetCareInfoDTO dto = toDTO(careInfo);

        return ResponseEntity.ok(new ApiResponse<>(
                200,
                "Care Info retrieved",
                dto));
    }

    @DeleteMapping("/{petId}")
    public ResponseEntity<ApiResponse<Void>> deleteCareInfo(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long petId) {

        extractEmail(authHeader); // Validates token

        petCareInfoService.deleteCareInfo(petId);

        return ResponseEntity.ok(new ApiResponse<>(
                200,
                "Care Info deleted",
                null));
    }

    // --- Entity to DTO conversion ---
    private PetCareInfoDTO toDTO(PetCareInfo entity) {
        if (entity == null) return null;

        return new PetCareInfoDTO(
                entity.getPetCareInfoId(),
                entity.getFood(),
                entity.getRoutine()
        );
    }
}

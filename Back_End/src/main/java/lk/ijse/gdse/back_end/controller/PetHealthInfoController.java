package lk.ijse.gdse.back_end.controller;

import lk.ijse.gdse.back_end.dto.ApiResponse;
import lk.ijse.gdse.back_end.dto.PetCareInfoDTO;
import lk.ijse.gdse.back_end.dto.PetHealthInfoDTO;
import lk.ijse.gdse.back_end.entity.PetHealthInfo;
import lk.ijse.gdse.back_end.repository.UserRepository;
import lk.ijse.gdse.back_end.service.PetHealthInfoService;
import lk.ijse.gdse.back_end.service.PetService;
import lk.ijse.gdse.back_end.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/pet-health")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PetHealthInfoController {
    private final PetHealthInfoService petHealthInfoService;
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    private String extractEmailFromHeader(String authHeader){
        if (authHeader == null || !authHeader.startsWith("Bearer ")){
            throw new RuntimeException("Unauthorized: Missing or invalid token");
        }
        String token = authHeader.substring(7);
        return jwtUtil.extractEmail(token);
    }


    @PostMapping("/{petId}")
    public ResponseEntity<ApiResponse<PetHealthInfoDTO>> addOrUpdateHealthInfo(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long petId,
            @RequestBody PetHealthInfoDTO dto){

        String email = extractEmailFromHeader(authHeader);
        userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found: " + email));

        PetHealthInfo saved = petHealthInfoService.addOrUpdatePetHealthInfo(petId, dto);

        // Convert to DTO before returning
        PetHealthInfoDTO responseDto = toDTO(saved);

        return ResponseEntity.ok(new ApiResponse<>(
                200,
                "Pet Health Info Saved Successfully",
                responseDto
        ));    }

    @GetMapping("/{petId}")
    public ResponseEntity<ApiResponse<PetHealthInfoDTO>> getPetHealthInfo(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long petId){

        String email = extractEmailFromHeader(authHeader);
        userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found: " + email));

        PetHealthInfo petHealthInfo = petHealthInfoService.getHealthInfoByPet(petId);
        PetHealthInfoDTO dto = toDTO(petHealthInfo);

        return ResponseEntity.ok(new ApiResponse<>(
                200,
                "Pet Health Info Retrieved Successfully",
                dto
        ));
    }

    @DeleteMapping("/{petId}")
    public ResponseEntity<ApiResponse<Void>> deletePetHealthInfo(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long petId){

        String email = extractEmailFromHeader(authHeader);
        userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found: " + email));

        petHealthInfoService.deletePetHealthInfo(petId);
        return ResponseEntity.ok(new ApiResponse<>(
                200,
                "Pet Health Info Deleted Successfully",
                null
        ));
    }

    private PetHealthInfoDTO toDTO(PetHealthInfo entity) {
        if (entity == null) return null;

        return new PetHealthInfoDTO(
                entity.getPetHealthInfoId(),
                entity.getVeterinarian(),
                entity.getMedicalNotes()
        );
    }
}



















































































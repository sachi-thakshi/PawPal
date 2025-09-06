package lk.ijse.gdse.back_end.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lk.ijse.gdse.back_end.dto.ApiResponse;
import lk.ijse.gdse.back_end.dto.PetVaccinationDTO;
import lk.ijse.gdse.back_end.entity.PetVaccination;
import lk.ijse.gdse.back_end.service.PetVaccinationService;
import lk.ijse.gdse.back_end.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/vaccination")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PetVaccinationController {

    private final PetVaccinationService petVaccinationService;
    private final JwtUtil jwtUtil;

    @PutMapping("/{petId}")
    public ResponseEntity<ApiResponse<PetVaccinationDTO>> replaceVaccination(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long petId,
            @RequestBody PetVaccinationDTO dto) {   // Accept single object

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401)
                    .body(new ApiResponse<>(401, "Unauthorized", null));
        }

        String token = authHeader.substring(7);
        String email = jwtUtil.extractEmail(token);

        // Save or replace the vaccination record
        PetVaccination saved = petVaccinationService.replaceVaccination(petId, dto);

        return ResponseEntity.ok(
                new ApiResponse<>(200, "Vaccination record updated", toDTO(saved))
        );
    }

//    @PostMapping("/{petId}")
//    public ResponseEntity<ApiResponse<List<PetVaccinationDTO>>> addVaccinations(
//            @RequestHeader("Authorization") String authHeader,
//            @PathVariable Long petId,
//            @RequestBody List<PetVaccinationDTO> dtos) {
//
//        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
//            return ResponseEntity.status(401)
//                    .body(new ApiResponse<>(401, "Unauthorized", null));
//        }
//
//        String token = authHeader.substring(7);
//        String email = jwtUtil.extractEmail(token);
//
//        // Save each vaccination
//        List<PetVaccinationDTO> responseDtos = dtos.stream()
//                .map(dto -> {
//                    PetVaccination vaccination = petVaccinationService.addVaccination(petId, dto);
//                    return toDTO(vaccination);
//                })
//                .toList();
//
//        return ResponseEntity.ok(
//                new ApiResponse<>(200, "Vaccination records saved", responseDtos)
//        );
//    }

    @GetMapping("/{petId}")
    public ResponseEntity<ApiResponse<List<PetVaccinationDTO>>> getVaccinations(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long petId) {

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401)
                    .body(new ApiResponse<>(401, "Unauthorized", null));
        }

        String token = authHeader.substring(7);
        String email = jwtUtil.extractEmail(token);

        List<PetVaccination> records = petVaccinationService.getVaccinations(petId);

        List<PetVaccinationDTO> dtos = records.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());

        return ResponseEntity.ok(new ApiResponse<>(200, "Vaccination records retrieved", dtos));
    }

    @DeleteMapping("/{vaccinationId}")
    public ResponseEntity<ApiResponse<Void>> deleteVaccination(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long vaccinationId) {

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401)
                    .body(new ApiResponse<>(401, "Unauthorized", null));
        }

        String token = authHeader.substring(7);
        String email = jwtUtil.extractEmail(token);

        petVaccinationService.deleteVaccination(vaccinationId);
        return ResponseEntity.ok(new ApiResponse<>(200, "Vaccination record deleted", null));
    }

    private PetVaccinationDTO toDTO(PetVaccination vaccination) {
        return new PetVaccinationDTO(
                vaccination.getPetVaccinationId(),
                vaccination.getVaccineName(),
                vaccination.getDateGiven(),
                vaccination.getDueDate()
        );
    }
}

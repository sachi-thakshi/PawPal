package lk.ijse.gdse.back_end.controller;

import lk.ijse.gdse.back_end.dto.ApiResponse;
import lk.ijse.gdse.back_end.dto.PetAdoptionDTO;
import lk.ijse.gdse.back_end.entity.PetAdoption;
import lk.ijse.gdse.back_end.service.AdoptionService;
import lk.ijse.gdse.back_end.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/pet-adoption")
@CrossOrigin
@RequiredArgsConstructor
public class PetAdoptionController {

    private final AdoptionService adoptionService;
    private final JwtUtil jwtUtil;

    private String extractEmailFromHeader(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new RuntimeException("Unauthorized: Missing or invalid token");
        }
        String token = authHeader.substring(7);
        return jwtUtil.extractEmail(token);
    }

    private PetAdoptionDTO convertToDTO(PetAdoption pet) {
        return PetAdoptionDTO.builder()
                .petAdoptionId(pet.getPetAdoptionId())
                .petName(pet.getPetName())
                .type(pet.getType())
                .breed(pet.getBreed())
                .age(pet.getAge())
                .gender(pet.getGender())
                .location(pet.getLocation())
                .description(pet.getDescription())
                .petImage(pet.getPetImage())
                .ownerUsername(pet.getOwner().getUsername())
                .ownerEmail(pet.getOwner().getEmail())
                .build();
    }

    @PostMapping("/add")
    public ResponseEntity<ApiResponse<PetAdoptionDTO>> addPet(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam(value = "petName", required = false) String petName,
            @RequestParam("type") String type,
            @RequestParam(value = "breed", required = false) String breed,
            @RequestParam(value = "age", required = false) String age,
            @RequestParam(value = "gender", required = false) String gender,
            @RequestParam("location") String location,
            @RequestParam("description") String description,
            @RequestParam(value = "image") MultipartFile image
    ) throws IOException {
        String email = extractEmailFromHeader(authHeader);

        PetAdoption pet = PetAdoption.builder()
                .petName(petName)
                .type(type)
                .breed(breed)
                .age(age)
                .gender(gender)
                .location(location)
                .description(description)
                .build();

        PetAdoption savedPet = adoptionService.addPetByEmailWithImage(pet, image, email);

        return ResponseEntity.ok(
                new ApiResponse<>(200, "Pet added successfully", convertToDTO(savedPet))
        );
    }

    @PutMapping("/update")
    public ResponseEntity<ApiResponse<PetAdoptionDTO>> updatePet(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam Long petAdoptionId,
            @RequestParam String petName,
            @RequestParam String type,
            @RequestParam String breed,
            @RequestParam String age,
            @RequestParam String gender,
            @RequestParam String location,
            @RequestParam String description,
            @RequestParam(value = "image", required = false) MultipartFile image
    ) throws IOException {
        String email = extractEmailFromHeader(authHeader);

        PetAdoption pet = PetAdoption.builder()
                .petAdoptionId(petAdoptionId)
                .petName(petName)
                .type(type)
                .breed(breed)
                .age(age)
                .gender(gender)
                .location(location)
                .description(description)
                .build();

        PetAdoption updatedPet = adoptionService.updatePetByOwner(pet, image, email);

        return ResponseEntity.ok(
                new ApiResponse<>(200, "Pet updated successfully", convertToDTO(updatedPet))
        );
    }

    @DeleteMapping("/{petId}")
    public ResponseEntity<ApiResponse<Void>> deletePet(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long petId
    ) {
        String email = extractEmailFromHeader(authHeader);
        adoptionService.deletePetByOwner(petId, email);

        return ResponseEntity.ok(new ApiResponse<>(200, "Pet deleted successfully", null));
    }

    @GetMapping("/available")
    public ResponseEntity<ApiResponse<List<PetAdoptionDTO>>> getAvailablePets() {
        List<PetAdoptionDTO> pets = adoptionService.getAllPets(); // method above
        return ResponseEntity.ok(new ApiResponse<>(200, "Available pets retrieved successfully", pets));
    }

    @GetMapping("/pending/{petId}")
    public ResponseEntity<ApiResponse<Boolean>> checkPending(@PathVariable Long petId) {
        boolean hasPending = adoptionService.hasPendingRequest(petId);
        return ResponseEntity.ok(new ApiResponse<>(200, "Checked successfully", hasPending));
    }

    @GetMapping("/owner")
    public ResponseEntity<ApiResponse<List<PetAdoptionDTO>>> getPetsByOwner(
            @RequestHeader("Authorization") String authHeader
    ) {
        String email = extractEmailFromHeader(authHeader);

        List<PetAdoptionDTO> pets = adoptionService.getPetsByOwnerEmail(email).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());

        return ResponseEntity.ok(new ApiResponse<>(200, "Owner pets retrieved successfully", pets));
    }

    @PostMapping("/request/{petId}")
    public ResponseEntity<ApiResponse<String>> adoptPet(
            @PathVariable Long petId,
            @RequestHeader("Authorization") String authHeader
    ) {
        try {
            String requesterEmail = extractEmailFromHeader(authHeader);
            adoptionService.createRequestByEmail(petId, requesterEmail);
            return ResponseEntity.ok(
                    new ApiResponse<>(200, "Adoption request sent successfully", null)
            );
        } catch (RuntimeException ex) {
            return ResponseEntity
                    .badRequest()
                    .body(new ApiResponse<>(400, ex.getMessage(), null));
        }
    }
}
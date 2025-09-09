package lk.ijse.gdse.back_end.controller;

import com.cloudinary.Cloudinary;
import lk.ijse.gdse.back_end.dto.ApiResponse;
import lk.ijse.gdse.back_end.dto.PetDTO;
import lk.ijse.gdse.back_end.entity.Pet;
import lk.ijse.gdse.back_end.service.PetService;
import lk.ijse.gdse.back_end.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/pets")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PetAccountsController {

    private final PetService petService;
    private final JwtUtil jwtUtil;

    private String extractEmailFromHeader(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new RuntimeException("Unauthorized: Missing or invalid token");
        }
        String token = authHeader.substring(7);
        return jwtUtil.extractEmail(token);
    }

    @GetMapping("/userPets")
    public ResponseEntity<ApiResponse<List<PetDTO>>> getUserPets(@RequestHeader("Authorization") String authHeader) {
        String email = extractEmailFromHeader(authHeader);

        List<Pet> pets = petService.getUserPets(email);
        List<PetDTO> petDTOs = pets.stream().map(this::convertToDTO).collect(Collectors.toList());

        return ResponseEntity.ok(new ApiResponse<>(200, "Success", petDTOs));
    }

    @PostMapping("/addPet")
    public ResponseEntity<ApiResponse<PetDTO>> addPet(@RequestHeader("Authorization") String authHeader,
                                                      @RequestBody PetDTO petDTO) {
        String email = extractEmailFromHeader(authHeader);

        Pet savedPet = petService.addPet(email, petDTO);
        return ResponseEntity.ok(new ApiResponse<>(200, "Pet Added Successfully", convertToDTO(savedPet)));
    }

    @PutMapping("/{petId}")
    public ResponseEntity<ApiResponse<PetDTO>> updatePet(@RequestHeader("Authorization") String authHeader,
                                                         @PathVariable Long petId,
                                                         @RequestBody PetDTO petDTO) {
        extractEmailFromHeader(authHeader); // Optional: Could validate ownership here too
        Pet updatedPet = petService.updatePet(petId, petDTO);

        return ResponseEntity.ok(new ApiResponse<>(200, "Pet Updated Successfully", convertToDTO(updatedPet)));
    }

    @DeleteMapping("/{petId}")
    public ResponseEntity<ApiResponse<Void>> deletePet(@RequestHeader("Authorization") String authHeader,
                                                       @PathVariable Long petId) {
        String email = extractEmailFromHeader(authHeader);

        boolean deleted = petService.deletePet(petId, email);

        if (deleted) {
            return ResponseEntity.ok(new ApiResponse<>(200, "Pet deleted successfully", null));
        } else {
            return ResponseEntity.status(404).body(new ApiResponse<>(404, "Pet not found or not authorized", null));
        }
    }

    @PostMapping("/addPetProfileImage")
    public ResponseEntity<ApiResponse<PetDTO>> addPetProfileImage(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam("petProfileImage") MultipartFile file,
            @RequestParam("petId") Long petId) {

        String email = extractEmailFromHeader(authHeader);

        // Ensure pet belongs to this user
        Pet pet = petService.uploadPetProfileImage(petId, file);
        if (!pet.getOwner().getEmail().equals(email)) {
            return ResponseEntity.status(403)
                    .body(new ApiResponse<>(403, "Not authorized to upload image for this pet", null));
        }

        Pet updatedPet = petService.uploadPetProfileImage(petId, file);

        return ResponseEntity.ok(
                new ApiResponse<>(200, "Pet Profile Image Uploaded Successfully", convertToDTO(updatedPet))
        );
    }

    @GetMapping("/all")
//    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<PetDTO>>> getAllPets() {
        List<Pet> pets = petService.getAllPets();
        List<PetDTO> petDTOs = pets.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());

        return ResponseEntity.ok(
                new ApiResponse<>(200, "All pets retrieved successfully", petDTOs)
        );
    }

    // DTO conversion
    private PetDTO convertToDTO(Pet pet) {
        return PetDTO.builder()
                .petId(pet.getPetId())
                .name(pet.getName())
                .type(pet.getType())
                .breed(pet.getBreed())
                .age(pet.getAge())
                .petProfileImage(pet.getPetProfileImage())
                .ownerName(pet.getOwner() != null ? pet.getOwner().getUsername() : null)
                .ownerEmail(pet.getOwner() != null ? pet.getOwner().getEmail() : null)
                .build();
    }
}



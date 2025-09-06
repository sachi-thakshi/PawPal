package lk.ijse.gdse.back_end.controller;

import lk.ijse.gdse.back_end.dto.ApiResponse;
import lk.ijse.gdse.back_end.dto.PetOwnerDTO;
import lk.ijse.gdse.back_end.entity.User;
import lk.ijse.gdse.back_end.service.PetOwnerService;
import lk.ijse.gdse.back_end.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/pet-owner")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PetOwnerAccountController {

    private final PetOwnerService petOwnerService;
    private final JwtUtil jwtUtil;

    @GetMapping("loggedPetOwner")
    public ResponseEntity<ApiResponse<PetOwnerDTO>> getLoggedPetOwner(@RequestHeader("Authorization") String authHeader){

        if (authHeader == null || !authHeader.startsWith("Bearer ")){
            return ResponseEntity.status(401).body(new ApiResponse<>(
                    401,
                    "Unauthorized",
                    null
            ));
        }

        String token = authHeader.substring(7);
        String email = jwtUtil.extractEmail(token);

        User user = petOwnerService.getPetOwnerByEmail(email);

        // Convert entity to DTO
        PetOwnerDTO dto = new PetOwnerDTO(
                user.getUsername(),
                user.getEmail(),
                user.getContactNumber(),
                user.getAddress(),
                null,
                user.getProfileImageUrl()
        );

        return ResponseEntity.ok(new ApiResponse<>(
                200,
                "Success",
                dto
        ));
    }

    @PutMapping("/updatePetOwner")
    public ResponseEntity<ApiResponse<Void>> updatePetOwner(@RequestHeader("Authorization") String authHeader,
                                                            @RequestBody PetOwnerDTO petOwnerDTO) {

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401).body(new ApiResponse<>(
                    401,
                    "Unauthorized",
                    null
            ));
        }

        String token = authHeader.substring(7);
        String email = jwtUtil.extractEmail(token);

        petOwnerService.updatePetOwner(email, petOwnerDTO);

        return ResponseEntity.ok(new ApiResponse<>(
                200,
                "User Updated Successfully",
                null
        ));
    }

    @PostMapping("/uploadProfileImage")
    public ResponseEntity<ApiResponse<PetOwnerDTO>> uploadProfileImage(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam("profileImage") MultipartFile file) {

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401).body(new ApiResponse<>(401, "Unauthorized", null));
        }

        String token = authHeader.substring(7);
        String email = jwtUtil.extractEmail(token);

        User user = petOwnerService.uploadProfileImage(email, file);

        PetOwnerDTO dto = new PetOwnerDTO(
                user.getUsername(),
                user.getEmail(),
                user.getContactNumber(),
                user.getAddress(),
                null,
                user.getProfileImageUrl()
        );

        return ResponseEntity.ok(new ApiResponse<>(200, "Profile Image Uploaded", dto));
    }
}


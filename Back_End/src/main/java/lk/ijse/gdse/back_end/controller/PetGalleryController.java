package lk.ijse.gdse.back_end.controller;

import lk.ijse.gdse.back_end.dto.PetGalleryDTO;
import lk.ijse.gdse.back_end.entity.PetGallery;
import lk.ijse.gdse.back_end.service.PetGalleryService;
import lk.ijse.gdse.back_end.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/pet-gallery")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PetGalleryController {
    private final PetGalleryService petGalleryService;
    private final JwtUtil jwtUtil;

    private void validateJwt(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new RuntimeException("Unauthorized: Missing or invalid token");
        }
        String token = authHeader.substring(7);
        jwtUtil.extractEmail(token);
    }

    public PetGalleryDTO convertToDTO(PetGallery petGallery) {
        return PetGalleryDTO.builder()
                .petGalleryId(petGallery.getPetGalleryId())
                .imageUrl(petGallery.getImageUrl())
                .description(petGallery.getDescription())
                .build();
    }

    @PostMapping("/upload")
    public ResponseEntity<PetGalleryDTO> uploadImage(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "description", required = false) String description
    ) throws IOException {
        validateJwt(authHeader);
        PetGallery saved = petGalleryService.saveImage(file, description);
        return ResponseEntity.ok(convertToDTO(saved));
    }

    @GetMapping("/{petGalleryId}")
    public ResponseEntity<PetGalleryDTO> getImageById(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long petGalleryId
    ) {
        validateJwt(authHeader);
        return petGalleryService.getImageById(petGalleryId)
                .map(petGallery -> ResponseEntity.ok(convertToDTO(petGallery)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/all")
    public ResponseEntity<List<PetGalleryDTO>> getAllImages(
            @RequestHeader("Authorization") String authHeader
    ) {
        validateJwt(authHeader);
        List<PetGalleryDTO> list = petGalleryService.getAllImages()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }

    @DeleteMapping("/{petGalleryId}")
    public ResponseEntity<Void> deleteImage(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long petGalleryId
    ) throws IOException {
        validateJwt(authHeader);
        petGalleryService.deleteImage(petGalleryId);
        return ResponseEntity.noContent().build();
    }
}

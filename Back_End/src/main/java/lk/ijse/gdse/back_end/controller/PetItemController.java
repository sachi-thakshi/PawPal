package lk.ijse.gdse.back_end.controller;

import lk.ijse.gdse.back_end.dto.ApiResponse;
import lk.ijse.gdse.back_end.dto.PetItemDTO;
import lk.ijse.gdse.back_end.entity.PetItem;
import lk.ijse.gdse.back_end.service.PetItemService;
import lk.ijse.gdse.back_end.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/pet-items")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PetItemController {
    private final PetItemService petItemService;
    private final JwtUtil jwtUtil;

    private String extractEmailFromHeader(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new RuntimeException("Unauthorized: Missing or invalid token");
        }
        String token = authHeader.substring(7);
        return jwtUtil.extractEmail(token);
    }

    private PetItemDTO convertToDTO(PetItem item) {
        return PetItemDTO.builder()
                .petItemId(item.getPetItemId())
                .petItemName(item.getPetItemName())
                .petItemCategory(item.getPetItemCategory())
                .petItemPrice(item.getPetItemPrice())
                .quantity(item.getQuantity())
                .petItemDescription(item.getPetItemDescription())
                .petItemImageUrl(item.getPetItemImageUrl())
                .build();
    }

    @GetMapping("/all")
    public ResponseEntity<ApiResponse<List<PetItemDTO>>> getAllItems(@RequestHeader("Authorization") String authHeader) {
        extractEmailFromHeader(authHeader); // Validate token

        List<PetItem> items = petItemService.getAllPetItems();
        List<PetItemDTO> dtos = items.stream().map(this::convertToDTO).collect(Collectors.toList());

        return ResponseEntity.ok(new ApiResponse<>(200, "Success", dtos));
    }

    @PostMapping("/add")
    public ResponseEntity<ApiResponse<PetItemDTO>> addItem(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam("name") String name,
            @RequestParam("category") String category,
            @RequestParam("price") double price,
            @RequestParam("quantity") int quantity,
            @RequestParam("description") String description,
            @RequestParam(value = "image", required = false) MultipartFile imageFile) {

        String email = extractEmailFromHeader(authHeader);

        PetItem petItem = PetItem.builder()
                .petItemName(name)
                .petItemCategory(category)
                .petItemPrice(price)
                .quantity(quantity)
                .petItemDescription(description)
                .build();

        PetItem savedItem = petItemService.addPetItem(petItem, imageFile);

        return ResponseEntity.ok(new ApiResponse<>(200, "Pet item added successfully", convertToDTO(savedItem)));
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<ApiResponse<PetItemDTO>> updateItem(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable("id") Long petItemId,
            @RequestParam("name") String name,
            @RequestParam("category") String category,
            @RequestParam("price") double price,
            @RequestParam("quantity") int quantity,
            @RequestParam("description") String description,
            @RequestParam(value = "image", required = false) MultipartFile imageFile) {

        String email = extractEmailFromHeader(authHeader);

        PetItem updatedItem = PetItem.builder()
                .petItemName(name)
                .petItemCategory(category)
                .petItemPrice(price)
                .quantity(quantity)
                .petItemDescription(description)
                .build();

        PetItem result = petItemService.updatePetItem(petItemId, updatedItem, imageFile);

        return ResponseEntity.ok(new ApiResponse<>(200, "Pet item updated successfully", convertToDTO(result)));
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteItem(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable("id") Long petItemId) {

        String email = extractEmailFromHeader(authHeader);

        petItemService.deletePetItem(petItemId);

        return ResponseEntity.ok(new ApiResponse<>(200, "Pet item deleted successfully", null));
    }
}

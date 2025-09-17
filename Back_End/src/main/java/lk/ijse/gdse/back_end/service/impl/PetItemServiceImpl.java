package lk.ijse.gdse.back_end.service.impl;

import com.cloudinary.Cloudinary;
import lk.ijse.gdse.back_end.entity.PetItem;
import lk.ijse.gdse.back_end.repository.PetItemRepository;
import lk.ijse.gdse.back_end.service.PetItemService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PetItemServiceImpl implements PetItemService {

    private final PetItemRepository petItemRepository;
    private final Cloudinary cloudinary;

    private Map uploadToCloudinary(MultipartFile file, String folder) {
        try {
            return cloudinary.uploader().upload(file.getBytes(), Map.of("folder", folder));
        } catch (IOException e) {
            throw new RuntimeException("Cloudinary upload failed: " + e.getMessage());
        }
    }

    private void deleteFromCloudinary(String publicId) {
        try {
            cloudinary.uploader().destroy(publicId, Map.of());
        } catch (IOException e) {
            throw new RuntimeException("Failed to delete image from Cloudinary: " + e.getMessage());
        }
    }

    @Override
    public PetItem addPetItem(PetItem petItem, MultipartFile imageFile) {
        if (imageFile != null && !imageFile.isEmpty()) {
            Map uploadResult = uploadToCloudinary(imageFile, "pet_items");
            petItem.setPetItemImageUrl((String) uploadResult.get("secure_url"));
            petItem.setPublicId((String) uploadResult.get("public_id"));
        }
        return petItemRepository.save(petItem);
    }


    @Override
    public PetItem updatePetItem(Long petItemId, PetItem updatedPetItem, MultipartFile imageFile) {
        return petItemRepository.findById(petItemId).map(existingItem -> {

            // Update fields
            existingItem.setPetItemName(updatedPetItem.getPetItemName());
            existingItem.setPetItemCategory(updatedPetItem.getPetItemCategory());
            existingItem.setPetItemPrice(updatedPetItem.getPetItemPrice());
            existingItem.setQuantity(updatedPetItem.getQuantity());
            existingItem.setPetItemDescription(updatedPetItem.getPetItemDescription());

            // Handle image
            if (imageFile != null && !imageFile.isEmpty()) {
                if (existingItem.getPublicId() != null) {
                    deleteFromCloudinary(existingItem.getPublicId());
                }

                Map uploadResult = uploadToCloudinary(imageFile, "pet_items");
                existingItem.setPetItemImageUrl((String) uploadResult.get("secure_url"));
                existingItem.setPublicId((String) uploadResult.get("public_id"));
            }

            return petItemRepository.save(existingItem);
        }).orElseThrow(() -> new RuntimeException("PetItem not found with ID: " + petItemId));
    }

    @Override
    public void deletePetItem(Long petItemId) {
        PetItem item = petItemRepository.findById(petItemId)
                .orElseThrow(() -> new RuntimeException("PetItem not found with ID: " + petItemId));

        // Remove image from Cloudinary
        if (item.getPublicId() != null && !item.getPublicId().isEmpty()) {
            deleteFromCloudinary(item.getPublicId());
        }

        petItemRepository.delete(item);
    }

    @Override
    public Optional<PetItem> getPetItemById(Long petItemId) {
        return petItemRepository.findById(petItemId);
    }

    @Override
    public List<PetItem> getAllPetItems() {
        return petItemRepository.findAll();
    }

    @Override
    public List<PetItem> getPetItemsByCategory(String category) {
        return petItemRepository.findByPetItemCategory(category);
    }

    @Override
    public Map<String, Long> getPetItemCountsByCategory() {
        Map<String, Long> counts = new HashMap<>();
        petItemRepository.countItemsByCategory().forEach(row -> {
            String category = (String) row[0];
            Long count = (Long) row[1];
            counts.put(category, count);
        });
        return counts;
    }
}

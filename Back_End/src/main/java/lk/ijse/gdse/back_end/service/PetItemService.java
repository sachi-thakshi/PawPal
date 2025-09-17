package lk.ijse.gdse.back_end.service;

import lk.ijse.gdse.back_end.entity.PetItem;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.Optional;

public interface PetItemService {
    PetItem addPetItem(PetItem petItem, MultipartFile imageFile);
    PetItem updatePetItem(Long id, PetItem petItem, MultipartFile imageFile);
    void deletePetItem(Long id);
    Optional<PetItem> getPetItemById(Long id);
    List<PetItem> getAllPetItems();
    List<PetItem> getPetItemsByCategory(String category);
    Map<String, Long> getPetItemCountsByCategory();
}

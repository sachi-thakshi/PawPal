package lk.ijse.gdse.back_end.service;

import lk.ijse.gdse.back_end.dto.PetDTO;
import lk.ijse.gdse.back_end.entity.Pet;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface PetService {
    List<Pet> getUserPets(String email);
    Pet addPet(String email, PetDTO petDTO);
    Pet updatePet(Long petId, PetDTO petDTO);
    boolean deletePet(Long petId, String email);
    Pet uploadPetProfileImage(Long petId, MultipartFile file);
    List<Pet> getAllPets();
}
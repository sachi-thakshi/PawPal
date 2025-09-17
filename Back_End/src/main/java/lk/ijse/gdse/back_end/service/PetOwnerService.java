package lk.ijse.gdse.back_end.service;

import lk.ijse.gdse.back_end.dto.PetOwnerDTO;
import lk.ijse.gdse.back_end.entity.User;
import org.springframework.web.multipart.MultipartFile;


public interface PetOwnerService {
    User getPetOwnerByEmail(String email);
    void updatePetOwner(String email, PetOwnerDTO dto);
    User uploadProfileImage(String email, MultipartFile file);
    long getMonthlyRegistrations();
}

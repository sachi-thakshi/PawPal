package lk.ijse.gdse.back_end.service;

import lk.ijse.gdse.back_end.entity.AdoptionRequest;
import lk.ijse.gdse.back_end.entity.PetAdoption;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

public interface AdoptionService {
    PetAdoption addPetByEmailWithImage(PetAdoption pet, MultipartFile image, String ownerEmail) throws IOException;
    List<PetAdoption> getAvailablePets();
    List<PetAdoption> getPetsByOwnerEmail(String ownerEmail);
    void deletePetByOwner(Long petId, String email);
    PetAdoption updatePetByOwner(PetAdoption pet, MultipartFile image, String email) throws IOException;

    AdoptionRequest createRequestByEmail(Long petId, String requesterEmail);
    List<AdoptionRequest> getRequestsByOwnerEmail(String ownerEmail);
    AdoptionRequest approveRequestWithOwnerCheck(Long requestId, String ownerEmail);
    AdoptionRequest declineRequestWithOwnerCheck(Long requestId, String ownerEmail);
}

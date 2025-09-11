package lk.ijse.gdse.back_end.service.impl;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lk.ijse.gdse.back_end.entity.AdoptionRequest;
import lk.ijse.gdse.back_end.entity.PetAdoption;
import lk.ijse.gdse.back_end.entity.User;
import lk.ijse.gdse.back_end.repository.AdoptionRequestRepository;
import lk.ijse.gdse.back_end.repository.PetAdoptionRepository;
import lk.ijse.gdse.back_end.repository.UserRepository;
import lk.ijse.gdse.back_end.service.AdoptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdoptionServiceImpl implements AdoptionService {

    private final PetAdoptionRepository petRepo;
    private final AdoptionRequestRepository requestRepo;
    private final UserRepository userRepo;
    private final Cloudinary cloudinary;

    @Override
    public PetAdoption addPetByEmailWithImage(PetAdoption pet, MultipartFile image, String ownerEmail) throws IOException {
        User owner = userRepo.findByEmail(ownerEmail)
                .orElseThrow(() -> new RuntimeException("Owner not found"));
        pet.setOwner(owner);
        pet.setDate(LocalDate.now());

        if (image != null && !image.isEmpty()) {
            var uploadResult = cloudinary.uploader().upload(image.getBytes(), ObjectUtils.emptyMap());
            pet.setPetImage((String) uploadResult.get("secure_url"));
            pet.setPublicId((String) uploadResult.get("public_id"));
        }

        return petRepo.save(pet);
    }

    @Override
    public List<PetAdoption> getAllPets() {
        return petRepo.findAll();
    }

    @Override
    public List<PetAdoption> getPetsByOwnerEmail(String ownerEmail) {
        User owner = userRepo.findByEmail(ownerEmail)
                .orElseThrow(() -> new RuntimeException("Owner not found"));
        return petRepo.findByOwner(owner);
    }

    @Override
    public PetAdoption updatePetByOwner(PetAdoption pet, MultipartFile image, String email) throws IOException {
        PetAdoption existing = petRepo.findById(pet.getPetAdoptionId())
                .orElseThrow(() -> new RuntimeException("Pet not found"));

        if (!existing.getOwner().getEmail().equals(email)) {
            throw new RuntimeException("Unauthorized");
        }

        // Update fields
        existing.setPetName(pet.getPetName());
        existing.setType(pet.getType());
        existing.setBreed(pet.getBreed());
        existing.setAge(pet.getAge());
        existing.setGender(pet.getGender());
        existing.setLocation(pet.getLocation());
        existing.setDescription(pet.getDescription());

        // Upload image if provided
        if (image != null && !image.isEmpty()) {
            // Delete old image if exists
            if (existing.getPublicId() != null && !existing.getPublicId().isEmpty()) {
                cloudinary.uploader().destroy(existing.getPublicId(), ObjectUtils.emptyMap());
            }

            var uploadResult = cloudinary.uploader().upload(image.getBytes(), ObjectUtils.emptyMap());
            existing.setPetImage((String) uploadResult.get("secure_url"));
            existing.setPublicId((String) uploadResult.get("public_id"));
        }

        return petRepo.save(existing);
    }

    @Override
    public void deletePetByOwner(Long petId, String email) {
        PetAdoption pet = petRepo.findById(petId)
                .orElseThrow(() -> new RuntimeException("Pet not found"));

        if (!pet.getOwner().getEmail().equals(email)) {
            throw new RuntimeException("Unauthorized");
        }

        // Delete image from Cloudinary if exists
        if (pet.getPublicId() != null && !pet.getPublicId().isEmpty()) {
            try {
                cloudinary.uploader().destroy(pet.getPublicId(), ObjectUtils.emptyMap());
            } catch (Exception e) {
                throw new RuntimeException("Failed to delete image from Cloudinary: " + e.getMessage());
            }
        }

        petRepo.delete(pet);
    }

    // ------------------ Adoption Request Sending ----------------------------
    @Override
    public AdoptionRequest createRequestByEmail(Long petId, String requesterEmail) {
        PetAdoption pet = petRepo.findById(petId)
                .orElseThrow(() -> new RuntimeException("Pet not found"));

        User requester = userRepo.findByEmail(requesterEmail)
                .orElseThrow(() -> new RuntimeException("Requester not found"));

        // Check if request already exists
        if (requestRepo.existsByPetAndRequester(pet, requester)) {
            throw new RuntimeException("You have already sent a request for this pet");
        }

        AdoptionRequest request = AdoptionRequest.builder()
                .pet(pet)
                .requester(requester)
                .approved(false)
                .requestDate(LocalDateTime.now())
                .build();

        return requestRepo.save(request);
    }

    @Override
    public List<AdoptionRequest> getPendingRequestsByOwnerEmail(String ownerEmail) {
        User owner = userRepo.findByEmail(ownerEmail)
                .orElseThrow(() -> new RuntimeException("Owner not found"));

        return requestRepo.findByPetOwnerAndApprovedFalse(owner);
    }

    @Override
    public AdoptionRequest approveRequestWithOwnerCheck(Long requestId, String ownerEmail) {
        AdoptionRequest request = requestRepo.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        if (!request.getPet().getOwner().getEmail().equals(ownerEmail)) {
            throw new RuntimeException("Unauthorized: Not the owner of this pet");
        }

        request.setApproved(true);
        return requestRepo.save(request);
    }

}
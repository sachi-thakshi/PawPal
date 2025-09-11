package lk.ijse.gdse.back_end.service.impl;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import jakarta.transaction.Transactional;
import lk.ijse.gdse.back_end.entity.AdoptionRequest;
import lk.ijse.gdse.back_end.entity.PetAdoption;
import lk.ijse.gdse.back_end.entity.User;
import lk.ijse.gdse.back_end.repository.AdoptionRequestRepository;
import lk.ijse.gdse.back_end.repository.PetAdoptionRepository;
import lk.ijse.gdse.back_end.repository.UserRepository;
import lk.ijse.gdse.back_end.service.AdoptionService;
import lk.ijse.gdse.back_end.service.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

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
    private final EmailService emailService;
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
                .approved(null)
                .requestDate(LocalDateTime.now())
                .build();

        return requestRepo.save(request);
    }

    @Override
    public List<AdoptionRequest> getRequestsByOwnerEmail(String ownerEmail) {
        User owner = userRepo.findByEmail(ownerEmail)
                .orElseThrow(() -> new RuntimeException("Owner not found"));

        return requestRepo.findByPet_Owner(owner);
    }

    @Override
    public AdoptionRequest approveRequestWithOwnerCheck(Long requestId, String ownerEmail) {
        AdoptionRequest request = requestRepo.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        if (!request.getPet().getOwner().getEmail().equals(ownerEmail)) {
            throw new RuntimeException("Unauthorized: Not the owner of this pet");
        }

        request.setApproved(true);
        requestRepo.save(request);

        // Send email to requester
        String subject = "Your adoption request has been approved!";
        String body = "<p>Hi " + request.getRequester().getUsername() + ",</p>"
                + "<p>Your adoption request for the pet <b>" + request.getPet().getPetName() + "</b> has been approved.</p>"
                + "<h4>Pet Details:</h4>"
                + "<ul>"
                + "<li>Type: " + request.getPet().getType() + "</li>"
                + "<li>Location: " + request.getPet().getLocation() + "</li>"
                + "</ul>"
                + "<h4>Owner Contact:</h4>"
                + "<ul>"
                + "<li>Name: " + request.getPet().getOwner().getUsername() + "</li>"
                + "<li>Email: " + request.getPet().getOwner().getEmail() + "</li>"
                + "<li>Contact: " + request.getPet().getOwner().getContactNumber() + "</li>"
                + "</ul>"
                + "<p>Thank you for using our service!</p>";

        emailService.sendEmail(
                request.getRequester().getEmail(),
                subject,
                body,
                request.getPet().getOwner().getEmail() // reply-to owner email
        );

        return request;
    }

    @Override
    @Transactional
    public AdoptionRequest declineRequestWithOwnerCheck(Long requestId, String ownerEmail) {
        AdoptionRequest request = requestRepo.findById(requestId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Request not found"));

        if (!request.getPet().getOwner().getEmail().equals(ownerEmail)) {
            throw new AccessDeniedException("You are not authorized to decline this request");
        }

        request.setApproved(false);
        requestRepo.save(request);

        // Send decline email to requester
        String subject = "Your adoption request has been declined";
        String body = "<p>Hi " + request.getRequester().getUsername() + ",</p>"
                + "<p>We are sorry to inform you that your adoption request for the pet <b>"
                + request.getPet().getPetName() + "</b> has been declined.</p>"
                + "<h4>Pet Details:</h4>"
                + "<ul>"
                + "<li>Type: " + request.getPet().getType() + "</li>"
                + "<li>Location: " + request.getPet().getLocation() + "</li>"
                + "</ul>"
                + "<h4>Owner Contact:</h4>"
                + "<ul>"
                + "<li>Name: " + request.getPet().getOwner().getUsername() + "</li>"
                + "<li>Email: " + request.getPet().getOwner().getEmail() + "</li>"
                + "<li>Contact: " + request.getPet().getOwner().getContactNumber() + "</li>"
                + "</ul>"
                + "<p>You may reach out if you have any questions.</p>";

        emailService.sendEmail(
                request.getRequester().getEmail(),
                subject,
                body,
                request.getPet().getOwner().getEmail() // reply-to owner email
        );

        return request;
    }
}
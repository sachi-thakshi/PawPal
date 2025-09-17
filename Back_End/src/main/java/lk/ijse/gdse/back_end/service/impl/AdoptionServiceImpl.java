package lk.ijse.gdse.back_end.service.impl;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import jakarta.transaction.Transactional;
import lk.ijse.gdse.back_end.dto.AdoptionRequestDTO;
import lk.ijse.gdse.back_end.dto.PetAdoptionDTO;
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
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

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
    public List<PetAdoptionDTO> getAllPets() {
        List<PetAdoption> pets = petRepo.findAll();

        return pets.stream().map(pet -> {
                    boolean hasApprovedRequest = requestRepo.existsByPetAndApprovedTrue(pet);
                    boolean hasPendingRequest = requestRepo.existsByPetAndApprovedIsNull(pet);

                    return PetAdoptionDTO.builder()
                            .petAdoptionId(pet.getPetAdoptionId())
                            .petName(pet.getPetName())
                            .type(pet.getType())
                            .breed(pet.getBreed())
                            .age(pet.getAge())
                            .gender(pet.getGender())
                            .location(pet.getLocation())
                            .description(pet.getDescription())
                            .petImage(pet.getPetImage())
                            .ownerUsername(
                                    pet.getOwner() != null ? pet.getOwner().getUsername() : null
                            )
                            .ownerEmail(
                                    pet.getOwner() != null ? pet.getOwner().getEmail() : null
                            )
                            .hasApprovedRequest(hasApprovedRequest)
                            .hasPendingRequest(hasPendingRequest)
                            .date(pet.getDate())
                            .build();
                }).filter(dto -> !dto.isHasApprovedRequest())
                .collect(Collectors.toList());
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

    @Override
    public boolean hasPendingRequest(Long petId) {
        PetAdoption pet = petRepo.findById(petId)
                .orElseThrow(() -> new RuntimeException("Pet not found"));
        return !requestRepo.findByPetAndApprovedIsNull(pet).isEmpty();
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

        List<AdoptionRequest> otherRequests = requestRepo.findByPetAndApprovedIsNull(request.getPet());
        for (AdoptionRequest r : otherRequests) {
            if (!r.getRequestId().equals(requestId)) {
                r.setApproved(false);
                requestRepo.save(r);
            }
        }

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

    @Override
    public List<AdoptionRequestDTO> getPendingRequestsForOwner(String ownerEmail) {
        User owner = userRepo.findByEmail(ownerEmail)
                .orElseThrow(() -> new RuntimeException("Owner not found"));

        List<AdoptionRequest> requests = requestRepo.findByPet_OwnerAndApprovedIsNull(owner);

        return requests.stream()
                .map(req -> AdoptionRequestDTO.builder()
                        .requestId(req.getRequestId())
                        .petName(req.getPet().getPetName())
                        .petType(req.getPet().getType())
                        .requesterName(req.getRequester().getUsername())
                        .requesterEmail(req.getRequester().getEmail())
                        .requestDate(req.getRequestDate())
                        .build())
                .toList();
    }

    @Override
    public List<AdoptionRequest> getAllRequests() {
        return requestRepo.findAll();
    }
    public List<AdoptionRequest> getRequestsByRequesterEmail(String email) {
        return requestRepo.findByRequesterEmail(email);
    }

    @Override
    public int getTodayAdoptionsCount() {
        return petRepo.countTodayAdoptions();
    }

    // Count approved adoptions this week
    @Override
    public int countWeekAdoptions() {
        LocalDate today = LocalDate.now();
        LocalDate startOfWeek = today.with(DayOfWeek.MONDAY);
        LocalDate endOfWeek = today.with(DayOfWeek.SUNDAY);
        return petRepo.countByDateBetween(startOfWeek, endOfWeek);
    }

    // Count pending requests this week
    @Override
    public int countWeekRequests() {
        LocalDate today = LocalDate.now();
        LocalDate startOfWeek = today.with(DayOfWeek.MONDAY);
        LocalDate endOfWeek = today.with(DayOfWeek.SUNDAY);
        return requestRepo.countByRequestDateBetweenAndApprovedFalse(startOfWeek, endOfWeek);
    }

    @Override
    public Map<String, Object> getWeeklyAdoptionsRequests() {
        Map<String, Object> response = new HashMap<>();

        LocalDate today = LocalDate.now();
        LocalDate startOfWeek = today.with(DayOfWeek.MONDAY);
        LocalDate endOfWeek = today.with(DayOfWeek.SUNDAY);

        // Fetch data from repository
        List<PetAdoption> adoptions = petRepo.findByDateBetween(startOfWeek, endOfWeek);
        List<AdoptionRequest> requests = requestRepo.findByRequestDateBetween(
                startOfWeek.atStartOfDay(),
                endOfWeek.atTime(23, 59, 59)
        );

        // Prepare chart data
        List<String> labels = new ArrayList<>();
        List<Long> adoptionCounts = new ArrayList<>();
        List<Long> requestCounts = new ArrayList<>();

        for (LocalDate date = startOfWeek; !date.isAfter(endOfWeek); date = date.plusDays(1)) {
            labels.add(date.toString());

            LocalDate finalDate = date;

            long dailyAdoptions = adoptions.stream()
                    .filter(a -> a.getDate().isEqual(finalDate))
                    .count();

            long dailyRequests = requests.stream()
                    .filter(r -> r.getRequestDate().toLocalDate().isEqual(finalDate))
                    .count();

            adoptionCounts.add(dailyAdoptions);
            requestCounts.add(dailyRequests);
        }

        response.put("labels", labels);
        response.put("adoptions", adoptionCounts);
        response.put("requests", requestCounts);

        return response;
    }


}
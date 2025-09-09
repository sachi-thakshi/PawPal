package lk.ijse.gdse.back_end.service.impl;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lk.ijse.gdse.back_end.dto.PetDTO;
import lk.ijse.gdse.back_end.entity.Pet;
import lk.ijse.gdse.back_end.entity.User;
import lk.ijse.gdse.back_end.repository.PetRepository;
import lk.ijse.gdse.back_end.repository.UserRepository;
import lk.ijse.gdse.back_end.service.PetService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PetServiceImpl implements PetService {
    private final Cloudinary cloudinary;
    private final PetRepository petRepository;
    private final UserRepository userRepository;

    @Override
    public List<Pet> getUserPets(String email){
        User owner = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));

        return petRepository.findByOwner(owner);
    }

    @Override
    public Pet addPet(String email, PetDTO petDTO){
        User owner = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));

        Pet pet = Pet.builder()
                .name(petDTO.getName())
                .type(petDTO.getType())
                .breed(petDTO.getBreed())
                .age(petDTO.getAge())
                .owner(owner)
                .build();

        return petRepository.save(pet);
    }

    @Override
    public Pet updatePet(Long petId, PetDTO petDTO){
        Pet pet = petRepository.findById(petId)
                .orElseThrow(() -> new RuntimeException("Pet not found: " + petId));

        if (petDTO.getName() != null) pet.setName(petDTO.getName());
        if (petDTO.getType() != null) pet.setType(petDTO.getType());
        if (petDTO.getBreed() != null) pet.setBreed(petDTO.getBreed());
        if (petDTO.getAge() != null) pet.setAge(petDTO.getAge());

        return petRepository.save(pet);
    }

    @Override
    public boolean deletePet(Long petId, String email) {
        Optional<Pet> petOpt = petRepository.findById(petId);

        if (petOpt.isPresent() && petOpt.get().getOwner().getEmail().equals(email)) {
            Pet pet = petOpt.get();

            // Delete profile image from Cloudinary if exists
            if (pet.getPublicId() != null && !pet.getPublicId().isEmpty()) {
                try {
                    cloudinary.uploader().destroy(pet.getPublicId(), ObjectUtils.emptyMap());
                } catch (Exception e) {
                    throw new RuntimeException("Failed to delete image from Cloudinary: " + e.getMessage());
                }
            }

            petRepository.delete(pet);
            return true;
        }

        return false;
    }

    @Override
    public Pet uploadPetProfileImage(Long petId, MultipartFile file) {
        Pet pet = petRepository.findById(petId)
                .orElseThrow(() -> new RuntimeException("Pet not found: " + petId));

        try {
            // Delete old image from Cloudinary if exists
            if (pet.getPublicId() != null && !pet.getPublicId().isEmpty()) {
                cloudinary.uploader().destroy(pet.getPublicId(), ObjectUtils.emptyMap());
            }

            // Upload new image
            var uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.emptyMap());
            String imageUrl = (String) uploadResult.get("secure_url");
            String publicId = (String) uploadResult.get("public_id");

            pet.setPetProfileImage(imageUrl);
            pet.setPublicId(publicId);

            return petRepository.save(pet);
        } catch (Exception e) {
            throw new RuntimeException("Cloudinary upload failed: " + e.getMessage());
        }
    }

    @Override
    public List<Pet> getAllPets() {
        return petRepository.findAll();
    }

    private String extractPublicIdFromUrl(String imageUrl) {
        // Example URL: https://res.cloudinary.com/demo/image/upload/v1694000000/sample.jpg
        // Extract "sample" part (without extension)
        String[] parts = imageUrl.split("/");
        String filename = parts[parts.length - 1]; // sample.jpg
        return filename.substring(0, filename.lastIndexOf('.'));
    }
}

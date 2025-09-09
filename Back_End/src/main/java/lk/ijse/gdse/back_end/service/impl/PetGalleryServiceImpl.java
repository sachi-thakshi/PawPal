package lk.ijse.gdse.back_end.service.impl;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lk.ijse.gdse.back_end.entity.PetGallery;
import lk.ijse.gdse.back_end.entity.User;
import lk.ijse.gdse.back_end.repository.PetGalleryRepository;
import lk.ijse.gdse.back_end.service.PetGalleryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PetGalleryServiceImpl implements PetGalleryService {
    private final PetGalleryRepository petGalleryRepository;
    private final Cloudinary cloudinary;

    public PetGallery saveImage(MultipartFile file, String description, User user) throws IOException {
        var uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.emptyMap());
        String imageUrl = (String) uploadResult.get("secure_url");
        String publicId = (String) uploadResult.get("public_id");

        PetGallery petGallery = PetGallery.builder()
                .imageUrl(imageUrl)
                .description(description)
                .publicId(publicId)
                .createdAt(LocalDateTime.now())
                .submittedBy(user) // important
                .build();

        return petGalleryRepository.save(petGallery);
    }

    public Optional<PetGallery> getImageById(Long petGalleryId) {
        return petGalleryRepository.findById(petGalleryId);
    }

    public void deleteImage(Long petGalleryId) throws IOException {
        Optional<PetGallery> optional = petGalleryRepository.findById(petGalleryId);
        if (optional.isPresent()) {
            PetGallery petGallery = optional.get();

            // Delete from Cloudinary
            cloudinary.uploader().destroy(petGallery.getPublicId(), ObjectUtils.emptyMap());

            // Delete from DB
            petGalleryRepository.deleteById(petGalleryId);
        } else {
            throw new RuntimeException("Photo not found with id: " + petGalleryId);
        }
    }

    public List<PetGallery> getAllImages() {
        return petGalleryRepository.findAll();
    }
}

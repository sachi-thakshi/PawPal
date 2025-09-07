package lk.ijse.gdse.back_end.service;

import lk.ijse.gdse.back_end.entity.PetGallery;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

public interface PetGalleryService {
    PetGallery saveImage(MultipartFile file, String description) throws IOException;
    Optional<PetGallery> getImageById(Long petGalleryId);
    void deleteImage(Long petGalleryId) throws IOException;
    List<PetGallery> getAllImages();
}
package lk.ijse.gdse.back_end.repository;

import lk.ijse.gdse.back_end.entity.PetGallery;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PetGalleryRepository extends JpaRepository<PetGallery, Long> {
    Optional<PetGallery> findByImageUrl(String imageUrl);
    Optional<PetGallery> findByDescription(String description);
}

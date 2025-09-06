package lk.ijse.gdse.back_end.repository;

import lk.ijse.gdse.back_end.entity.Pet;
import lk.ijse.gdse.back_end.entity.PetHealthInfo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PetHealthInfoRepository extends JpaRepository<PetHealthInfo, Long> {
    Optional<PetHealthInfo> findByPet(Pet pet);
}

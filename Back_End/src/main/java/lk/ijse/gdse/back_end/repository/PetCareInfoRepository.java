package lk.ijse.gdse.back_end.repository;

import lk.ijse.gdse.back_end.dto.PetCareInfoDTO;
import lk.ijse.gdse.back_end.entity.Pet;
import lk.ijse.gdse.back_end.entity.PetCareInfo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PetCareInfoRepository extends JpaRepository<PetCareInfo, Long> {
    Optional<PetCareInfo> findByPet(Pet pet);
}

package lk.ijse.gdse.back_end.repository;

import lk.ijse.gdse.back_end.entity.AdoptionRequest;
import lk.ijse.gdse.back_end.entity.PetAdoption;
import lk.ijse.gdse.back_end.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AdoptionRequestRepository extends JpaRepository<AdoptionRequest, Long> {
    List<AdoptionRequest> findByPet_Owner(User owner);
    boolean existsByPetAndRequester(PetAdoption pet, User requester);
    List<AdoptionRequest> findByPetAndApprovedIsNull(PetAdoption pet);
    boolean existsByPetAndApprovedIsNull(PetAdoption pet);
    boolean existsByPetAndApprovedTrue(PetAdoption pet);

    List<AdoptionRequest> findByPet_OwnerAndApprovedIsNull(User owner);
    List<AdoptionRequest> findAll();
    List<AdoptionRequest> findByRequesterEmail(String email);
    int countByRequestDateBetweenAndApprovedFalse(LocalDate start, LocalDate end);

    List<AdoptionRequest> findByRequestDateBetween(LocalDateTime startDateTime, LocalDateTime endDateTime);
}

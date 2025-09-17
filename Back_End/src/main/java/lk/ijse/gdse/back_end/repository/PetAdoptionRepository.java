package lk.ijse.gdse.back_end.repository;

import lk.ijse.gdse.back_end.entity.PetAdoption;
import lk.ijse.gdse.back_end.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PetAdoptionRepository extends JpaRepository<PetAdoption, Long> {
    List<PetAdoption> findByOwner(User owner);
    @Query("SELECT p FROM PetAdoption p WHERE NOT EXISTS (" +
            "SELECT r FROM AdoptionRequest r WHERE r.pet = p AND r.approved = true)")
    List<PetAdoption> findAllAvailablePets();

    @Query("SELECT p FROM PetAdoption p JOIN FETCH p.owner")
    List<PetAdoption> findAllWithOwner();

    @Query("SELECT COUNT(pa) FROM PetAdoption pa WHERE pa.date = CURRENT_DATE")
    int countTodayAdoptions();

    int countByDateBetween(LocalDate start, LocalDate end);

    int countByDate(LocalDate date);

    List<PetAdoption> findByDateBetween(LocalDate startDate, LocalDate endDate);
}

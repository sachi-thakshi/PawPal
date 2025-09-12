package lk.ijse.gdse.back_end.repository;

import lk.ijse.gdse.back_end.entity.Pet;
import lk.ijse.gdse.back_end.entity.PetVaccination;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface PetVaccinationRepository extends JpaRepository<PetVaccination, Long> {
    List<PetVaccination> findByPet(Pet pet);
    List<PetVaccination> findByPet_Owner_EmailAndDueDateAfterOrderByDueDateAsc(String email, LocalDate dueDate);
}

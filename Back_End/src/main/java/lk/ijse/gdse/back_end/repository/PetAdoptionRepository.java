package lk.ijse.gdse.back_end.repository;

import lk.ijse.gdse.back_end.entity.PetAdoption;
import lk.ijse.gdse.back_end.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PetAdoptionRepository extends JpaRepository<PetAdoption, Long> {
    List<PetAdoption> findByOwner(User owner);
}

package lk.ijse.gdse.back_end.repository;

import lk.ijse.gdse.back_end.entity.PetReport;
import lk.ijse.gdse.back_end.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PetReportRepository extends JpaRepository<PetReport, Long> {

    // Get all reports by the owner (user)
    List<PetReport> findByOwner(User owner);

    // Get all reports by type (LOST or FOUND)
    List<PetReport> findByType(String type);

    // Get all reports from a specific location
    List<PetReport> findByLocationContainingIgnoreCase(String location);

    // Get all reports ordered by latest
    List<PetReport> findAllByOrderByReportedAtDesc();

    List<PetReport> findByOwnerEmailOrderByReportedAtDesc(String ownerEmail);
}

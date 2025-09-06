package lk.ijse.gdse.back_end.repository;

import lk.ijse.gdse.back_end.entity.User;
import lk.ijse.gdse.back_end.entity.VetAppointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VetAppointmentRepository extends JpaRepository<VetAppointment, Long> {
    List<VetAppointment> findByOwner(User owner);
    List<VetAppointment> findByServiceType(String serviceType);
}

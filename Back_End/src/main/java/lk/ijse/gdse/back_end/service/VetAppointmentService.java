package lk.ijse.gdse.back_end.service;

import lk.ijse.gdse.back_end.dto.VetAppointmentDTO;
import lk.ijse.gdse.back_end.entity.VetAppointment;

import java.util.List;

public interface VetAppointmentService {

    VetAppointment addAppointment(Long userId, VetAppointmentDTO appointmentDTO);

    List<VetAppointment> getAppointmentsByUser(Long userId);

    VetAppointment updateAppointment(Long appointmentId, VetAppointmentDTO dto);

    void deleteAppointment(Long appointmentId);

    List<VetAppointment> getAppointmentsByServiceType(String serviceType);

    List<VetAppointment> getAllAppointments();
}

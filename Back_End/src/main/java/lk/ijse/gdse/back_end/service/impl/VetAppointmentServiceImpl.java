package lk.ijse.gdse.back_end.service.impl;

import lk.ijse.gdse.back_end.dto.VetAppointmentDTO;
import lk.ijse.gdse.back_end.entity.User;
import lk.ijse.gdse.back_end.entity.VetAppointment;
import lk.ijse.gdse.back_end.repository.UserRepository;
import lk.ijse.gdse.back_end.repository.VetAppointmentRepository;
import lk.ijse.gdse.back_end.service.VetAppointmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class VetAppointmentServiceImpl implements VetAppointmentService {
    private final VetAppointmentRepository vetAppointmentRepository;
    private final UserRepository userRepository;

    // Add a new vet appointment
    public VetAppointment addAppointment(Long userId, VetAppointmentDTO appointmentDTO) {
        User owner = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));

        VetAppointment appointment = VetAppointment.builder()
                .owner(owner)
                .ownerName(appointmentDTO.getOwnerName())
                .ownerContactNumber(appointmentDTO.getOwnerContactNumber())
                .petName(appointmentDTO.getPetName())
                .serviceType(appointmentDTO.getServiceType())
                .appointmentDateTime(appointmentDTO.getAppointmentDateTime())
                .notes(appointmentDTO.getNotes())
                .build();

        return vetAppointmentRepository.save(appointment);
    }

    // Get all appointments for a user
    public List<VetAppointment> getAppointmentsByUser(Long userId) {
        User owner = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));

        return vetAppointmentRepository.findByOwner(owner);
    }

    public VetAppointment updateAppointment(Long appointmentId, VetAppointmentDTO dto) {
        VetAppointment appointment = vetAppointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found with id: " + appointmentId));

        if (dto.getOwnerName() != null) appointment.setOwnerName(dto.getOwnerName());
        if (dto.getOwnerContactNumber() != null) appointment.setOwnerContactNumber(dto.getOwnerContactNumber());
        if (dto.getPetName() != null) appointment.setPetName(dto.getPetName());
        if (dto.getServiceType() != null) appointment.setServiceType(dto.getServiceType());
        if (dto.getAppointmentDateTime() != null) appointment.setAppointmentDateTime(dto.getAppointmentDateTime());
        if (dto.getNotes() != null) appointment.setNotes(dto.getNotes());

        return vetAppointmentRepository.save(appointment);
    }

    // Delete an appointment by ID
    public void deleteAppointment(Long appointmentId) {
        VetAppointment appointment = vetAppointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found with ID: " + appointmentId));

        vetAppointmentRepository.delete(appointment);
    }

    // Find appointments by service type
    public List<VetAppointment> getAppointmentsByServiceType(String serviceType) {
        return vetAppointmentRepository.findByServiceType(serviceType);
    }

    public List<VetAppointment> getAllAppointments() {
        return vetAppointmentRepository.findAll();
    }
}

package lk.ijse.gdse.back_end.controller;

import lk.ijse.gdse.back_end.dto.ApiResponse;
import lk.ijse.gdse.back_end.dto.VetAppointmentDTO;
import lk.ijse.gdse.back_end.entity.VetAppointment;
import lk.ijse.gdse.back_end.service.VetAppointmentService;
import lk.ijse.gdse.back_end.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/vet-appointment")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class VetAppointmentController {
    private final VetAppointmentService vetAppointmentService;
    private final JwtUtil jwtUtil;

    @PostMapping("/{userId}")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    public ResponseEntity<ApiResponse<VetAppointmentDTO>> createAppointment(
                @RequestHeader("Authorization") String authHeader,
                @RequestBody VetAppointmentDTO appointmentDTO) {

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401).body(new ApiResponse<>(
                    401,
                    "Unauthorized",
                    null
            ));
        }

        String token = authHeader.substring(7);
        Long userId = jwtUtil.extractUserId(token);

        VetAppointment appointment = vetAppointmentService.addAppointment(userId, appointmentDTO);
        VetAppointmentDTO responseDto = convertToDTO(appointment);

        return ResponseEntity.ok(new ApiResponse<>(
                200,
                "Appointment Created Successfully",
                responseDto
        ));
    }

    @GetMapping("/user")
    public ResponseEntity<ApiResponse<List<VetAppointmentDTO>>> getAppointmentsByUser(
            @RequestHeader("Authorization") String authHeader) {

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401).body(new ApiResponse<>(
                    401,
                    "Unauthorized",
                    null
            ));
        }

        String token = authHeader.substring(7);
        Long userId = jwtUtil.extractUserId(token);

        List<VetAppointment> appointments = vetAppointmentService.getAppointmentsByUser(userId);
        List<VetAppointmentDTO> appointmentDTOS = appointments.stream()
                                                              .map(this::convertToDTO)
                                                              .collect(Collectors.toList());
        return ResponseEntity.ok(new ApiResponse<>(
                200,
                "Appointments Retrieved Successfully",
                appointmentDTOS
        ));
    }

    @PutMapping("/{appointmentId}")
    public ResponseEntity<ApiResponse<VetAppointmentDTO>> updateAppointment(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long appointmentId,
            @RequestBody VetAppointmentDTO dto) {

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401)
                    .body(new ApiResponse<>(401, "Unauthorized", null));
        }

        String token = authHeader.substring(7);
        jwtUtil.extractUserId(token);

        VetAppointment updated = vetAppointmentService.updateAppointment(appointmentId, dto);
        VetAppointmentDTO responseDTO = convertToDTO(updated);

        return ResponseEntity.ok(new ApiResponse<>(
                200,
                "Appointment updated successfully",
                responseDTO
        ));
    }

    @DeleteMapping("/{appointmentId}")
    public ResponseEntity<ApiResponse<Void>> deleteAppointment(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long appointmentId) {

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401)
                    .body(new ApiResponse<>(401, "Unauthorized", null));
        }

        String token = authHeader.substring(7);
        jwtUtil.extractUserId(token);

        vetAppointmentService.deleteAppointment(appointmentId);
        return ResponseEntity.ok(new ApiResponse<>(
                200,
                "Appointment deleted successfully",
                null
        ));
    }

    @GetMapping("/all")
    public ResponseEntity<ApiResponse<List<VetAppointmentDTO>>> getAllAppointments(
            @RequestHeader("Authorization") String authHeader) {

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401)
                    .body(new ApiResponse<>(401, "Unauthorized", null));
        }

        // Optionally verify admin role here
        String token = authHeader.substring(7);
        jwtUtil.extractUserId(token); // just to validate token

        List<VetAppointment> appointments = vetAppointmentService.getAllAppointments();
        List<VetAppointmentDTO> appointmentDTOS = appointments.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());

        return ResponseEntity.ok(new ApiResponse<>(200, "All appointments retrieved successfully", appointmentDTOS));
    }

    private VetAppointmentDTO convertToDTO(VetAppointment appointment) {
        return new VetAppointmentDTO(
                appointment.getVetAppointmentId(),
                appointment.getOwnerName(),
                appointment.getOwnerContactNumber(),
                appointment.getPetName(),
                appointment.getServiceType(),
                appointment.getAppointmentDateTime(),
                appointment.getNotes(),
                appointment.getOwner() != null ? appointment.getOwner().getUserId() : null
        );
    }
}

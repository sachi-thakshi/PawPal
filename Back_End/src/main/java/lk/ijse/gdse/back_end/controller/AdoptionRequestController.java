package lk.ijse.gdse.back_end.controller;

import lk.ijse.gdse.back_end.dto.AdoptionRequestDTO;
import lk.ijse.gdse.back_end.dto.ApiResponse;
import lk.ijse.gdse.back_end.entity.AdoptionRequest;
import lk.ijse.gdse.back_end.service.AdoptionService;
import lk.ijse.gdse.back_end.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/adoption-requests")
@CrossOrigin
@RequiredArgsConstructor
public class AdoptionRequestController {
    private final AdoptionService service;
    private final JwtUtil jwtUtil;

    private String extractEmailFromHeader(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new RuntimeException("Unauthorized: Missing token");
        }
        String token = authHeader.substring(7);
        return jwtUtil.extractEmail(token);
    }

    private AdoptionRequestDTO toRequestDTO(AdoptionRequest request) {
        return AdoptionRequestDTO.builder()
                .requestId(request.getRequestId())
                .approved(request.getApproved())
                .requestDate(request.getRequestDate())

                // requester info
                .requesterId(request.getRequester().getUserId())
                .requesterName(request.getRequester().getUsername())
                .requesterEmail(request.getRequester().getEmail())

                // pet info
                .petId(request.getPet().getPetAdoptionId())
                .petName(request.getPet().getPetName())
                .petType(request.getPet().getType())
                .petImage(request.getPet().getPetImage())
                .petLocation(request.getPet().getLocation())

                // owner info
                .ownerUsername(request.getPet().getOwner().getUsername())
                .ownerEmail(request.getPet().getOwner().getEmail())

                .build();
    }

    @GetMapping("/owner")
    public ResponseEntity<ApiResponse<List<AdoptionRequestDTO>>> getPendingRequests(@RequestHeader("Authorization") String authHeader) {
        String email = extractEmailFromHeader(authHeader);
        List<AdoptionRequest> requests = service.getRequestsByOwnerEmail(email);

        List<AdoptionRequestDTO> dtoList = requests.stream()
                .map(this::toRequestDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(new ApiResponse<>(200, "Success", dtoList));
    }

    @PostMapping("/{requestId}/approve")
    public ResponseEntity<ApiResponse<AdoptionRequestDTO>> approveRequest(
            @PathVariable Long requestId,
            @RequestHeader("Authorization") String authHeader) {
        try {
            String ownerEmail = extractEmailFromHeader(authHeader);
            AdoptionRequest request = service.approveRequestWithOwnerCheck(requestId, ownerEmail);
            return ResponseEntity.ok(new ApiResponse<>(200, "Request approved successfully", toRequestDTO(request)));
        } catch (RuntimeException ex) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(400, ex.getMessage(), null));
        }
    }

    @PostMapping("/{requestId}/decline")
    public ResponseEntity<ApiResponse<AdoptionRequestDTO>> declineRequest(
            @PathVariable Long requestId,
            @RequestHeader("Authorization") String authHeader) {
        try {
            String ownerEmail = extractEmailFromHeader(authHeader);
            AdoptionRequest request = service.declineRequestWithOwnerCheck(requestId, ownerEmail);
            return ResponseEntity.ok(new ApiResponse<>(200, "Request declined successfully", toRequestDTO(request)));
        } catch (RuntimeException ex) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(400, ex.getMessage(), null));
        }
    }

    @PostMapping("/request/{petId}")
    public ResponseEntity<ApiResponse<String>> createRequest(
            @PathVariable Long petId,
            @RequestHeader("Authorization") String authHeader) {
        try {
            String requesterEmail = extractEmailFromHeader(authHeader);
            service.createRequestByEmail(petId, requesterEmail);
            return ResponseEntity.ok(new ApiResponse<>(200, "Adoption request sent successfully", null));
        } catch (RuntimeException ex) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(400, ex.getMessage(), null));
        }
    }

    @GetMapping("/all")
    public ResponseEntity<ApiResponse<List<AdoptionRequestDTO>>> getAllRequests(
            @RequestHeader("Authorization") String authHeader) {

        List<AdoptionRequest> requests = service.getAllRequests();

        List<AdoptionRequestDTO> dtoList = requests.stream()
                .map(this::toRequestDTO)
                .collect(Collectors.toList());

        return ResponseEntity.ok(new ApiResponse<>(200, "Success", dtoList));
    }
}

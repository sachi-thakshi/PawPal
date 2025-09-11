package lk.ijse.gdse.back_end.controller;

import lk.ijse.gdse.back_end.dto.AdoptionRequestDTO;
import lk.ijse.gdse.back_end.entity.AdoptionRequest;
import lk.ijse.gdse.back_end.service.AdoptionService;
import lk.ijse.gdse.back_end.util.JwtUtil;
import lombok.RequiredArgsConstructor;
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

    private String validateAndGetEmail(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer "))
            throw new RuntimeException("Unauthorized: Missing token");
        String token = authHeader.substring(7);
        return jwtUtil.extractEmail(token);
    }

    private AdoptionRequestDTO toRequestDTO(AdoptionRequest request) {
        return AdoptionRequestDTO.builder()
                .requestId(request.getRequestId())
                .petId(request.getPet().getPetAdoptionId())
                .petName(request.getPet().getPetName())
                .requesterUsername(request.getRequester().getUsername())
                .requesterEmail(request.getRequester().getEmail())
                .approved(request.isApproved())
                .build();
    }

    // Customer B requests adoption (JWT determines requester)
    @PostMapping("/request")
    public AdoptionRequestDTO createRequest(@RequestParam Long petId,
                                            @RequestHeader("Authorization") String authHeader) {
        String email = validateAndGetEmail(authHeader);
        AdoptionRequest request = service.createRequestByEmail(petId, email);
        return toRequestDTO(request);
    }

    // Customer A views pending requests for their pets
    @GetMapping("/owner")
    public List<AdoptionRequestDTO> getPendingRequests(@RequestHeader("Authorization") String authHeader) {
        String email = validateAndGetEmail(authHeader);
        List<AdoptionRequest> requests = service.getPendingRequestsByOwnerEmail(email);
        return requests.stream().map(this::toRequestDTO).collect(Collectors.toList());
    }

    // Customer A approves a request
    @PostMapping("/{requestId}/approve")
    public AdoptionRequestDTO approveRequest(@PathVariable Long requestId,
                                             @RequestHeader("Authorization") String authHeader) {
        String email = validateAndGetEmail(authHeader);
        AdoptionRequest request = service.approveRequestWithOwnerCheck(requestId, email);
        return toRequestDTO(request);
    }
}

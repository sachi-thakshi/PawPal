package lk.ijse.gdse.back_end.controller;

import lk.ijse.gdse.back_end.dto.AdminDTO;
import lk.ijse.gdse.back_end.dto.ApiResponse;
import lk.ijse.gdse.back_end.entity.User;
import lk.ijse.gdse.back_end.service.AdminService;
import lk.ijse.gdse.back_end.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AdminController {
    private final AdminService adminService;
    private final JwtUtil jwtUtil;

    private ResponseEntity<ApiResponse<Void>> validateAuthHeader(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401).body(new ApiResponse<>(401, "Unauthorized", null));
        }
        return null;
    }

    private String extractEmail(String authHeader) {
        return jwtUtil.extractEmail(authHeader.substring(7));
    }

    private AdminDTO convertToDTO(User user) {
        return new AdminDTO(
                user.getUsername(),
                user.getEmail(),
                user.getContactNumber(),
                user.getAddress(),
                null,
                user.getProfileImageUrl()
        );
    }

    @GetMapping("/loggedAdmin")
    public ResponseEntity<ApiResponse<AdminDTO>> getLoggedAdmin(@RequestHeader("Authorization") String authHeader) {
        ResponseEntity<ApiResponse<Void>> errorResponse = validateAuthHeader(authHeader);
        if (errorResponse != null) return ResponseEntity.status(401).body(new ApiResponse<>(401, "Unauthorized", null));

        User user = adminService.getAdminByEmail(extractEmail(authHeader));
        return ResponseEntity.ok(new ApiResponse<>(200, "Success", convertToDTO(user)));
    }

    @PutMapping("/updateAdmin")
    public ResponseEntity<ApiResponse<Void>> updateAdmin(@RequestHeader("Authorization") String authHeader,
                                                         @RequestBody AdminDTO adminDTO) {
        ResponseEntity<ApiResponse<Void>> errorResponse = validateAuthHeader(authHeader);
        if (errorResponse != null) return errorResponse;

        adminService.updateAdmin(extractEmail(authHeader), adminDTO);
        return ResponseEntity.ok(new ApiResponse<>(200, "User Updated Successfully", null));
    }

    @PostMapping("/uploadProfileImage")
    public ResponseEntity<ApiResponse<AdminDTO>> uploadProfileImage(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam("profileImage") MultipartFile file) {
        ResponseEntity<ApiResponse<Void>> errorResponse = validateAuthHeader(authHeader);
        if (errorResponse != null) return ResponseEntity.status(401).body(new ApiResponse<>(401, "Unauthorized", null));

        User user = adminService.uploadProfileImage(extractEmail(authHeader), file);
        return ResponseEntity.ok(new ApiResponse<>(200, "Profile Image Uploaded", convertToDTO(user)));
    }
}

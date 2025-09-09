package lk.ijse.gdse.back_end.controller;

import lk.ijse.gdse.back_end.dto.AdminDTO;
import lk.ijse.gdse.back_end.dto.ApiResponse;
import lk.ijse.gdse.back_end.entity.User;
import lk.ijse.gdse.back_end.service.AdminService;
import lk.ijse.gdse.back_end.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

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

    @GetMapping("/all")
    public ResponseEntity<ApiResponse<List<AdminDTO>>> getAllAdmins() {
        List<AdminDTO> admins = adminService.getAllAdmins().stream()
                .map(user -> AdminDTO.builder()
                        .username(user.getUsername())
                        .email(user.getEmail())
                        .contactNumber(user.getContactNumber())
                        .address(user.getAddress())
                        .profileImageUrl(user.getProfileImageUrl())
                        .build())
                .toList();

        return ResponseEntity.ok(
                new ApiResponse<>(200, "All admins retrieved successfully", admins)
        );
    }

    @PostMapping("/add")
    public ResponseEntity<ApiResponse<AdminDTO>> addAdmin(
            @RequestParam String username,
            @RequestParam String email,
            @RequestParam String password,
            @RequestParam(required = false) String contactNumber,
            @RequestParam(required = false) String address,
            @RequestParam(required = false) MultipartFile profileImage) {

        AdminDTO dto = AdminDTO.builder()
                .username(username)
                .email(email)
                .password(password)
                .contactNumber(contactNumber)
                .address(address)
                .build();

        User admin = adminService.addAdmin(dto, profileImage);

        AdminDTO response = AdminDTO.builder()
                .username(admin.getUsername())
                .email(admin.getEmail())
                .contactNumber(admin.getContactNumber())
                .address(admin.getAddress())
                .profileImageUrl(admin.getProfileImageUrl())
                .build();

        return ResponseEntity.ok(new ApiResponse<>(200, "Admin added successfully", response));
    }

    @DeleteMapping("/delete/{email}")
    public ResponseEntity<ApiResponse<Void>> deleteAdmin(@PathVariable String email) {
        adminService.deleteAdminByEmail(email);
        return ResponseEntity.ok(new ApiResponse<>(200, "Admin deleted successfully", null));
    }
}

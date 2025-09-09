package lk.ijse.gdse.back_end.service.impl;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lk.ijse.gdse.back_end.dto.AdminDTO;
import lk.ijse.gdse.back_end.entity.Role;
import lk.ijse.gdse.back_end.entity.User;
import lk.ijse.gdse.back_end.repository.UserRepository;
import lk.ijse.gdse.back_end.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional
public class AdminServiceImpl implements AdminService {
    private final Cloudinary cloudinary;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public User getAdminByEmail(String email){
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));
    }

    @Override
    public void updateAdmin(String email, AdminDTO dto) {
        User user = getAdminByEmail(email);

        if(dto.getUsername() != null) user.setUsername(dto.getUsername());
        if(dto.getPassword() != null && !dto.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(dto.getPassword()));
        }
        if(dto.getContactNumber() != null) user.setContactNumber(dto.getContactNumber());
        if(dto.getAddress() != null) user.setAddress(dto.getAddress());

        userRepository.save(user);
    }

    @Override
    public User uploadProfileImage(String email, MultipartFile file) {
        User user = getAdminByEmail(email);

        try {
            // Delete old image from Cloudinary if exists
            if (user.getProfilePublicId() != null && !user.getProfilePublicId().isEmpty()) {
                cloudinary.uploader().destroy(user.getProfilePublicId(), ObjectUtils.emptyMap());
            }

            // Upload new image
            Map uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.emptyMap());
            String imageUrl = uploadResult.get("secure_url").toString();
            String publicId = uploadResult.get("public_id").toString();

            user.setProfileImageUrl(imageUrl);
            user.setProfilePublicId(publicId);

            return userRepository.save(user);

        } catch (IOException e) {
            throw new RuntimeException("Cloudinary upload failed: " + e.getMessage());
        }
    }

    @Override
    public List<User> getAllAdmins() {
        return userRepository.findByRole(Role.ADMIN);
    }

    @Override
    public User addAdmin(AdminDTO dto, MultipartFile profileImage) {
        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new RuntimeException("Email already exists: " + dto.getEmail());
        }

        User user = User.builder()
                .username(dto.getUsername())
                .email(dto.getEmail())
                .password(passwordEncoder.encode(dto.getPassword()))
                .contactNumber(dto.getContactNumber())
                .address(dto.getAddress())
                .role(Role.ADMIN)
                .build();

        // Upload image BEFORE saving to DB
        if (profileImage != null && !profileImage.isEmpty()) {
            user = uploadProfileImage(user, profileImage);
        }

        return userRepository.save(user);
    }

    // Overloaded method to handle image upload for unsaved user
    private User uploadProfileImage(User user, MultipartFile file) {
        try {
            Map uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.emptyMap());
            String imageUrl = uploadResult.get("secure_url").toString();
            String publicId = uploadResult.get("public_id").toString();

            user.setProfileImageUrl(imageUrl);
            user.setProfilePublicId(publicId);

            return user;
        } catch (IOException e) {
            throw new RuntimeException("Cloudinary upload failed: " + e.getMessage());
        }
    }

    @Override
    public void deleteAdminByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));

        // Optional: Delete profile image from Cloudinary
        if (user.getProfilePublicId() != null && !user.getProfilePublicId().isEmpty()) {
            try {
                cloudinary.uploader().destroy(user.getProfilePublicId(), ObjectUtils.emptyMap());
            } catch (IOException e) {
                throw new RuntimeException("Failed to delete profile image from Cloudinary: " + e.getMessage());
            }
        }

        userRepository.delete(user);
    }
}

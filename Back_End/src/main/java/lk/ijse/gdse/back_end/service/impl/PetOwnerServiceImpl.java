package lk.ijse.gdse.back_end.service.impl;

import com.cloudinary.Cloudinary;
import lk.ijse.gdse.back_end.dto.PetOwnerDTO;
import lk.ijse.gdse.back_end.entity.User;
import lk.ijse.gdse.back_end.repository.UserRepository;
import lk.ijse.gdse.back_end.service.PetOwnerService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional
public class PetOwnerServiceImpl implements PetOwnerService {
    private final Cloudinary cloudinary;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public User getPetOwnerByEmail(String email){
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));
    }

    public void updatePetOwner(String email, PetOwnerDTO dto) {
        User user = getPetOwnerByEmail(email);

        if(dto.getUsername() != null) user.setUsername(dto.getUsername());
        if(dto.getPassword() != null && !dto.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(dto.getPassword()));
        }
        if(dto.getContactNumber() != null) user.setContactNumber(dto.getContactNumber());
        if(dto.getAddress() != null) user.setAddress(dto.getAddress());

        userRepository.save(user);
    }

    public User uploadProfileImage(String email, MultipartFile file) {
        User user = getPetOwnerByEmail(email);

        try {
            Map uploadResult = cloudinary.uploader().upload(file.getBytes(), Map.of("folder", "profile-images"));
            String imageUrl = uploadResult.get("secure_url").toString();

            user.setProfileImageUrl(imageUrl);
            userRepository.save(user);

            return user;

        } catch (IOException e) {
            throw new RuntimeException("Cloudinary upload failed: " + e.getMessage());
        }
    }
}

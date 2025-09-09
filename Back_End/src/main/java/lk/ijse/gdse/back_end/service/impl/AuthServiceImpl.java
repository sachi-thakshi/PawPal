package lk.ijse.gdse.back_end.service.impl;

import lk.ijse.gdse.back_end.dto.AuthDTO;
import lk.ijse.gdse.back_end.dto.AuthResponseDTO;
import lk.ijse.gdse.back_end.dto.RegisterDTO;
import lk.ijse.gdse.back_end.entity.User;
import lk.ijse.gdse.back_end.repository.UserRepository;
import lk.ijse.gdse.back_end.service.AuthService;
import lk.ijse.gdse.back_end.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;


@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @Override
    public AuthResponseDTO authenticate(AuthDTO authDTO){
        User user = userRepository.findByEmail(authDTO.getEmail())  // user innwada balanwa nathnm exception ekak throw karanwa global exception ekak thiyena nisa
                .orElseThrow(() -> new RuntimeException("User Not Found"));

        if (!passwordEncoder.matches(authDTO.getPassword(), user.getPassword())) { // user dena password ekai user obj eke password ekai same da balanwa
            throw new BadCredentialsException("Invalid Password");
        }

        String token = jwtUtil.generateToken(user.getEmail(), user.getUserId());  // token generate

        return new AuthResponseDTO(
                token,
                user.getEmail(),
                user.getUsername(),
                user.getRole().name(),
                user.getUserId()
        );
    }

    @Override
    public String register(RegisterDTO registerDTO){
        if (userRepository.findByEmail(registerDTO.getEmail()).isPresent()){
            throw new RuntimeException("Email Already Exists");
        }

        User user = User.builder()
                .username(registerDTO.getUsername())
                .email(registerDTO.getEmail())
                .contactNumber(registerDTO.getContactNumber())
                .password(passwordEncoder.encode(registerDTO.getPassword()))
                .role(registerDTO.getRole())
                .build();

        userRepository.save(user);

        return "User Registration Success";
    }
}

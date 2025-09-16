package lk.ijse.gdse.back_end.util;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lk.ijse.gdse.back_end.entity.Role;
import lk.ijse.gdse.back_end.entity.User;
import lk.ijse.gdse.back_end.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class OAuth2LoginAuthenticationFilter implements AuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {

        OAuth2User oauthUser = (OAuth2User) authentication.getPrincipal();

        // Extract Google info
        String email = oauthUser.getAttribute("email");
        String name = oauthUser.getAttribute("name");

        // Check if user exists, else create with default role
        User user = userRepository.findByEmail(email).orElseGet(() -> {
            User newUser = new User();
            newUser.setEmail(email);
            newUser.setUsername(name);
            newUser.setProvider("GOOGLE");
            newUser.setRole(Role.CUSTOMER); // ✅ Default role for Google users
            return userRepository.save(newUser);
        });

        // Generate JWT
        String token = jwtUtil.generateToken(user.getEmail(), user.getUserId());

        // Redirect to front-end with token
        String redirectUrl = "http://localhost:63342/PawPal/Front_End/pages/pet-owner-dashboard.html?token=" + token;
        response.sendRedirect(redirectUrl);
    }
}

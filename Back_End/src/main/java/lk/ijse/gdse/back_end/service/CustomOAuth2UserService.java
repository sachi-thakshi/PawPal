package lk.ijse.gdse.back_end.service;

import lk.ijse.gdse.back_end.entity.Role;
import lk.ijse.gdse.back_end.entity.User;
import lk.ijse.gdse.back_end.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oauthUser = super.loadUser(userRequest);

        String email = oauthUser.getAttribute("email");
        String name = oauthUser.getAttribute("name");
        String picture = oauthUser.getAttribute("picture");

        Optional<User> existingUser = userRepository.findByEmail(email);

        if (existingUser == null) {
            // New user → register in DB
            User newUser = new User();
            newUser.setEmail(email);
            newUser.setUsername(name);
            newUser.setRole(Role.valueOf("CUSTOMER")); // default role
            newUser.setProfileImageUrl(picture);
            userRepository.save(newUser);
        }

        return oauthUser;
    }
}

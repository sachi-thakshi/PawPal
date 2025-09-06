package lk.ijse.gdse.back_end.config;

import lk.ijse.gdse.back_end.repository.UserRepository;
import lk.ijse.gdse.back_end.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;

@Configuration
@RequiredArgsConstructor
public class ApplicationConfig {
    private final UserRepository userRepository;

    @Bean
    public UserDetailsService userDetailsService() { // register wunu userwa aragena bean ekak widihata register karanwa
        return username ->
                userRepository.findByEmail(username)
                        .map(user -> new org.springframework.security.core.userdetails.User(
                                user.getEmail(),
                                user.getPassword(),
                                List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()))
                        )).orElseThrow(
                                () -> new UsernameNotFoundException("User Not Found")
                        );
    }

    @Bean
    public PasswordEncoder passwordEncoder(){ // Bcrypt password encoder
        return new BCryptPasswordEncoder();
    }
}

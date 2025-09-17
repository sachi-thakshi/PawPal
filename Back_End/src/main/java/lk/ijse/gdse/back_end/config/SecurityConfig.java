package lk.ijse.gdse.back_end.config;

import lk.ijse.gdse.back_end.service.CustomOAuth2UserService;
import lk.ijse.gdse.back_end.util.JwtAuthFilter;
import lk.ijse.gdse.back_end.util.JwtUtil;
import lk.ijse.gdse.back_end.util.OAuth2LoginAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {
    private final UserDetailsService userDetailsService;
    private final JwtAuthFilter jwtAuthFilter;
    private final PasswordEncoder passwordEncoder;
    private final CustomOAuth2UserService customOAuth2UserService;
    private final JwtUtil  jwtUtil;
    private final OAuth2LoginAuthenticationFilter oAuth2LoginSuccessHandler;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .authorizeHttpRequests(auth ->
                        auth
                                .requestMatchers("/auth/**").permitAll()
                                .requestMatchers("/oauth2/**").permitAll()
                                .requestMatchers("/pet-gallery/**").permitAll() // allow public gallery viewing
                                .requestMatchers("/pet-report/all").permitAll()       // reports listing
                                .requestMatchers("/pet-report/type/**").permitAll()  // LOST/FOUND reports
                                .requestMatchers("/admin/add").permitAll()
                                .requestMatchers("/admin/**").hasRole("ADMIN")
                                .requestMatchers("/blog/all").permitAll()
                                .requestMatchers("/api/email/**").permitAll()
                                .requestMatchers(HttpMethod.GET, "/pet-adoption/**").permitAll()     // anyone can view pets
                                .requestMatchers(HttpMethod.POST, "/pet-adoption/add").authenticated() // only registered users
                                .requestMatchers(HttpMethod.PUT, "/pet-adoption/update/**").authenticated()
                                .requestMatchers("/forgot-password/**").permitAll()

                                .requestMatchers("/payment/**").permitAll()  // All payment endpoints
                                .requestMatchers("/health").permitAll()             // Health check
                                .requestMatchers("/").permitAll()

                                .requestMatchers("/chat/**").permitAll()

                                .requestMatchers("/admin-dashboard/**").permitAll()

                                .anyRequest().authenticated())

                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                .authenticationProvider(authenticationProvider())

                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)

                .oauth2Login(oauth2 -> oauth2
                        .userInfoEndpoint(userInfo -> userInfo.userService(customOAuth2UserService))
                        .successHandler(oAuth2LoginSuccessHandler)  // use the bean we just created
                        .failureUrl("http://localhost:63342/PawPal/Front_End/pages/authentication.html?error=true")
                );

        return http.build();
    }

    @Bean
    public AuthenticationProvider authenticationProvider(){
        DaoAuthenticationProvider daoAuthenticationProvider = new DaoAuthenticationProvider();
        daoAuthenticationProvider.setUserDetailsService(userDetailsService);
        daoAuthenticationProvider.setPasswordEncoder(passwordEncoder);

        return daoAuthenticationProvider;
    }

    // --- CORS Configuration ---
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:63342"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setExposedHeaders(List.of("Authorization"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
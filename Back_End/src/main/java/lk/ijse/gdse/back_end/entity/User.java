package lk.ijse.gdse.back_end.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long userId;

    private String username;
    private String email;
    private String contactNumber;
    private String address;
    private String password;

    @Enumerated(EnumType.STRING)
    private Role role;

    @Column(name = "profile_image_url", nullable = true)
    private String profileImageUrl;

    @Column(name = "profile_public_id", nullable = true)
    private String profilePublicId;

    @Column(name = "otp")
    private String otp;

    @Column(name = "otp_expiry")
    private LocalDateTime otpExpiry;

    @OneToMany(mappedBy = "owner", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    @JsonManagedReference
    private List<Pet> pets;

    @OneToMany(mappedBy = "owner", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<VetAppointment> appointments;

    @OneToMany(mappedBy = "owner", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<PetReport> petReports;

    @OneToMany(mappedBy = "submittedBy", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<PetGallery> galleries;
}

package lk.ijse.gdse.back_end.dto;

import jakarta.persistence.*;
import lk.ijse.gdse.back_end.entity.Role;
import lombok.Data;

@Data
public class RegisterDTO {
    private String username;
    private String email;
    private String contactNumber;
    private String password;
    private Role role; // USER or ADMIN
}

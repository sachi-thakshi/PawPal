package lk.ijse.gdse.back_end.service;

import lk.ijse.gdse.back_end.dto.AuthDTO;
import lk.ijse.gdse.back_end.dto.AuthResponseDTO;
import lk.ijse.gdse.back_end.dto.RegisterDTO;

public interface AuthService {
    AuthResponseDTO authenticate(AuthDTO authDTO);
    String register(RegisterDTO registerDTO);
}
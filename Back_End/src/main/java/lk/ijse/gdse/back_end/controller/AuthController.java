package lk.ijse.gdse.back_end.controller;

import lk.ijse.gdse.back_end.dto.ApiResponse;
import lk.ijse.gdse.back_end.dto.AuthDTO;
import lk.ijse.gdse.back_end.dto.RegisterDTO;
import lk.ijse.gdse.back_end.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse> registerUser(@RequestBody RegisterDTO registerDTO){
        return ResponseEntity.ok(new ApiResponse(
                200,
                "Success",
                authService.register(registerDTO)
        ));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse>login(@RequestBody AuthDTO authDTO){
        return ResponseEntity.ok(new ApiResponse(
                200,
                "OK",
                authService.authenticate(authDTO)
        ));
    }
}

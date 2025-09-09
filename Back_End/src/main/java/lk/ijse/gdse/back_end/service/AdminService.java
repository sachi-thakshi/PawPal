package lk.ijse.gdse.back_end.service;

import lk.ijse.gdse.back_end.dto.AdminDTO;
import lk.ijse.gdse.back_end.entity.User;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface AdminService {
    User getAdminByEmail(String email);
    void updateAdmin(String email, AdminDTO dto);
    User uploadProfileImage(String email, MultipartFile file);
    List<User> getAllAdmins();
    User addAdmin(AdminDTO dto, MultipartFile profileImage);
    void deleteAdminByEmail(String email);

}

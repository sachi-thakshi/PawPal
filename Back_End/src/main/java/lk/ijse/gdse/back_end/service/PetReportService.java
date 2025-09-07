package lk.ijse.gdse.back_end.service;

import lk.ijse.gdse.back_end.dto.PetReportDTO;
import lk.ijse.gdse.back_end.entity.PetReport;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface PetReportService {

    PetReport addReport(Long userId, PetReportDTO dto, MultipartFile imageFile);

    PetReport updateReport(Long reportId, PetReportDTO dto, MultipartFile imageFile);

    void deleteReport(Long reportId);

    List<PetReport> getReportsByUser(Long userId);

    List<PetReport> getReportsByType(String type);

    List<PetReport> getAllReportsSorted();

    PetReport getReportById(Long reportId);
}

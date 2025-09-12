package lk.ijse.gdse.back_end.service.impl;

import com.cloudinary.Cloudinary;
import lk.ijse.gdse.back_end.dto.PetReportDTO;
import lk.ijse.gdse.back_end.entity.PetReport;
import lk.ijse.gdse.back_end.entity.PetReportType;
import lk.ijse.gdse.back_end.entity.User;
import lk.ijse.gdse.back_end.repository.PetReportRepository;
import lk.ijse.gdse.back_end.repository.UserRepository;
import lk.ijse.gdse.back_end.service.PetReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PetReportServiceImpl implements PetReportService {
    private final PetReportRepository petReportRepository;
    private final UserRepository userRepository;
    private final Cloudinary cloudinary;

    @Override
    public PetReport addReport(Long userId, PetReportDTO dto, MultipartFile imageFile) {
        User owner = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));

        String imageUrl = null;
        String publicId = null;

        if (imageFile != null && !imageFile.isEmpty()) {
            Map uploadResult = uploadToCloudinary(imageFile, "lost_found_pets");
            imageUrl = (String) uploadResult.get("secure_url");
            publicId = (String) uploadResult.get("public_id");
        } else {
            // Handle case when no image is uploaded
            publicId = null; // or set a default like "none"
        }

        PetReport report = PetReport.builder()
                .owner(owner)
                .type(PetReportType.valueOf(dto.getType()))
                .petName(dto.getPetName())
                .description(dto.getDescription())
                .location(dto.getLocation())
                .imageUrl(imageUrl)
                .publicId(publicId)  // now always set
                .reportedAt(LocalDateTime.now())
                .build();

        return petReportRepository.save(report);
    }

    private Map uploadToCloudinary(MultipartFile file, String folder) {
        try {
            return cloudinary.uploader().upload(file.getBytes(), Map.of("folder", folder));
        } catch (IOException e) {
            throw new RuntimeException("Cloudinary upload failed: " + e.getMessage());
        }
    }

    @Override
    public List<PetReport> getReportsByUser(Long userId) {
        User owner = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));

        return petReportRepository.findByOwner(owner);
    }

    @Override
    public PetReport updateReport(Long reportId, PetReportDTO dto, MultipartFile imageFile) {
        PetReport report = petReportRepository.findById(reportId)
                .orElseThrow(() -> new RuntimeException("Pet report not found with ID: " + reportId));

        // Update fields
        if (dto.getPetName() != null) report.setPetName(dto.getPetName());
        if (dto.getDescription() != null) report.setDescription(dto.getDescription());
        if (dto.getLocation() != null) report.setLocation(dto.getLocation());
        if (dto.getType() != null) report.setType(PetReportType.valueOf(dto.getType()));

        if (imageFile != null && !imageFile.isEmpty()) {
            // Delete old image from Cloudinary if exists
            if (report.getPublicId() != null && !report.getPublicId().isEmpty()) {
                deleteFromCloudinary(report.getPublicId());
            }

            // Upload new image
            Map uploadResult = uploadToCloudinary(imageFile, "lost_found_pets");
            report.setImageUrl((String) uploadResult.get("secure_url"));
            report.setPublicId((String) uploadResult.get("public_id"));
        } else {
            // Ensure publicId remains null if no image uploaded
            if (report.getImageUrl() == null) {
                report.setPublicId(null);
            }
        }

        return petReportRepository.save(report);
    }

    @Override
    public void deleteReport(Long reportId) {
        PetReport report = petReportRepository.findById(reportId)
                .orElseThrow(() -> new RuntimeException("Pet report not found with ID: " + reportId));

        // Delete image from Cloudinary if exists
        if (report.getPublicId() != null && !report.getPublicId().isEmpty()) {
            deleteFromCloudinary(report.getPublicId());
        }

        petReportRepository.delete(report);
    }

    // Get all reports by type (LOST or FOUND)
    @Override
    public List<PetReport> getReportsByType(String type) {
        return petReportRepository.findByType(type);
    }

    //Get all recent reports
    @Override
    public List<PetReport> getAllReportsSorted() {
        return petReportRepository.findAllByOrderByReportedAtDesc();
    }

    private void deleteFromCloudinary(String publicId) {
        try {
            cloudinary.uploader().destroy(publicId, Map.of());
        } catch (IOException e) {
            throw new RuntimeException("Failed to delete image from Cloudinary: " + e.getMessage());
        }
    }

    @Override
    public PetReport getReportById(Long reportId) {
        return petReportRepository.findById(reportId)
                .orElseThrow(() -> new RuntimeException("Pet report not found with ID: " + reportId));
    }

    @Override
    public List<PetReportDTO> getLatestReportsForOwner(String ownerEmail) {
        List<PetReport> reports = petReportRepository.findByOwnerEmailOrderByReportedAtDesc(ownerEmail);

        return reports.stream()
                .map(report -> PetReportDTO.builder()
                        .reportId(report.getReportId())
                        .petName(report.getPetName())
                        .description(report.getDescription())
                        .location(report.getLocation())
                        .type(report.getType().name()) // "LOST" or "FOUND"
                        .reportedAt(report.getReportedAt())
                        .imageUrl(report.getImageUrl())
                        .build())
                .collect(Collectors.toList());
    }

}

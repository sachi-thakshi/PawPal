    package lk.ijse.gdse.back_end.dto;

    import lombok.AllArgsConstructor;
    import lombok.Builder;
    import lombok.Data;
    import lombok.NoArgsConstructor;

    import java.time.LocalDateTime;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public class PetReportDTO {
        private Long reportId;
        private String petName;
        private String description;
        private String location;
        private String type; // Should be either "LOST" or "FOUND"
        private LocalDateTime reportedAt;
        private String imageUrl;
    }

package lk.ijse.gdse.back_end.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class NotificationDTO {
    private List<AdoptionRequestDTO> latestAdoptionRequests;
    private List<PetReportDTO> petReports;
    private List<PetVaccinationDTO> vaccinationReminders;
}

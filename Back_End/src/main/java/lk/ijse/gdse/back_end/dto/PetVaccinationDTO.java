package lk.ijse.gdse.back_end.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PetVaccinationDTO {
    private Long petVaccinationId;
    private String vaccineName;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate dateGiven;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate dueDate;
}

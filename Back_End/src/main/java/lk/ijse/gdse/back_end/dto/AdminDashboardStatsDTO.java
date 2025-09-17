package lk.ijse.gdse.back_end.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AdminDashboardStatsDTO {
    private int dailyAdoptions;
    private long monthlyRegistrations;
    private int totalPets;
    private double todayIncome;
}

package lk.ijse.gdse.back_end.service.impl;

import lk.ijse.gdse.back_end.dto.AdminDashboardStatsDTO;
import lk.ijse.gdse.back_end.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AdminDashboardServiceImpl implements AdminDashboardService {
    private final PetOwnerService petOwnerService;
    private final PetService petService;
    private final OrderService orderService;
    private final AdoptionService adoptionService;

    @Override
    public AdminDashboardStatsDTO getDashboardStats() {
        int dailyAdoptions = adoptionService.getTodayAdoptionsCount();
        long monthlyRegistrations = petOwnerService.getMonthlyRegistrations();
        int totalPets = petService.getAllPets().size();
        double todayIncome = orderService.getTodayIncome();

        return new AdminDashboardStatsDTO(dailyAdoptions, monthlyRegistrations, totalPets, todayIncome);
    }
}

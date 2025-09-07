package lk.ijse.gdse.back_end.service.impl;

import lk.ijse.gdse.back_end.dto.PetCareInfoDTO;
import lk.ijse.gdse.back_end.entity.Pet;
import lk.ijse.gdse.back_end.entity.PetCareInfo;
import lk.ijse.gdse.back_end.repository.PetCareInfoRepository;
import lk.ijse.gdse.back_end.repository.PetRepository;
import lk.ijse.gdse.back_end.service.PetCareInfoService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PetCareInfoServiceImpl implements PetCareInfoService {
    private final PetCareInfoRepository petCareInfoRepository;
    private final PetRepository petRepository;

    public PetCareInfo addOrUpdateCareInfo(Long petId, PetCareInfoDTO dto) {
        Pet pet = petRepository.findById(petId)
                .orElseThrow(() -> new RuntimeException("Pet not found with id: " + petId));

        PetCareInfo careInfo = petCareInfoRepository.findByPet(pet)
                .map(existing -> {
                    existing.setFood(dto.getFood());
                    existing.setRoutine(dto.getRoutine());
                    return existing;
                })
                .orElse(PetCareInfo.builder()
                        .pet(pet)
                        .food(dto.getFood())
                        .routine(dto.getRoutine())
                        .build());

        return petCareInfoRepository.save(careInfo);
    }

    public PetCareInfo getCareInfo(Long petId) {
        Pet pet = petRepository.findById(petId)
                .orElseThrow(() -> new RuntimeException("Pet not found with id: " + petId));

        return petCareInfoRepository.findByPet(pet)
                .orElseThrow(() -> new RuntimeException("Care info not found for pet id: " + petId));
    }

    public void deleteCareInfo(Long petId) {
        PetCareInfo careInfo = getCareInfo(petId);
        petCareInfoRepository.delete(careInfo);
    }
}

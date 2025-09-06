package lk.ijse.gdse.back_end.service;

import lk.ijse.gdse.back_end.dto.PetHealthInfoDTO;
import lk.ijse.gdse.back_end.entity.Pet;
import lk.ijse.gdse.back_end.entity.PetHealthInfo;
import lk.ijse.gdse.back_end.repository.PetHealthInfoRepository;
import lk.ijse.gdse.back_end.repository.PetRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PetHealthInfoService {
    private final PetHealthInfoRepository petHealthInfoRepository;
    private final PetRepository petRepository;

    public PetHealthInfo addOrUpdatePetHealthInfo(Long petId, PetHealthInfoDTO dto){
        Pet pet = petRepository.findById(petId)
                .orElseThrow(() -> new RuntimeException("Pet not found with Id: " + petId));

        Optional<PetHealthInfo> existingInfoOpt  = petHealthInfoRepository.findByPet(pet);
        PetHealthInfo healthInfo;

        if(existingInfoOpt.isPresent()){
            healthInfo = existingInfoOpt.get();
            healthInfo.setVeterinarian(dto.getVeterinarian());
            healthInfo.setMedicalNotes(dto.getMedicalNotes());
        } else {
            healthInfo = PetHealthInfo.builder()
                    .pet(pet)
                    .veterinarian(dto.getVeterinarian())
                    .medicalNotes(dto.getMedicalNotes())
                    .build();
        }

        return petHealthInfoRepository.save(healthInfo);
    }

    public PetHealthInfo getHealthInfoByPet(Long petId){
        Pet pet = petRepository.findById(petId)
                .orElseThrow(() -> new RuntimeException("Pet not found with Id: " + petId));

        return petHealthInfoRepository.findByPet(pet)
                .orElseThrow(() -> new RuntimeException("Pet Health Info not found for Pet with Id: " + petId));
    }

    public void deletePetHealthInfo(Long petId){
        PetHealthInfo healthInfo = getHealthInfoByPet(petId);
        petHealthInfoRepository.delete(healthInfo);
    }
}

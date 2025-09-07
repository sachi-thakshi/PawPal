package lk.ijse.gdse.back_end.service;

import lk.ijse.gdse.back_end.dto.PetHealthInfoDTO;
import lk.ijse.gdse.back_end.entity.PetHealthInfo;


public interface PetHealthInfoService {
    PetHealthInfo addOrUpdatePetHealthInfo(Long petId, PetHealthInfoDTO dto);
    PetHealthInfo getHealthInfoByPet(Long petId);
    void deletePetHealthInfo(Long petId);
}
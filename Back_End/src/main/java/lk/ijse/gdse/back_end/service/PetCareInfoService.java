package lk.ijse.gdse.back_end.service;

import lk.ijse.gdse.back_end.dto.PetCareInfoDTO;
import lk.ijse.gdse.back_end.entity.PetCareInfo;


public interface PetCareInfoService {
    PetCareInfo addOrUpdateCareInfo(Long petId, PetCareInfoDTO dto);
    PetCareInfo getCareInfo(Long petId);
    void deleteCareInfo(Long petId);
}
package lk.ijse.gdse.back_end.service;

import lk.ijse.gdse.back_end.dto.PetVaccinationDTO;
import lk.ijse.gdse.back_end.entity.PetVaccination;

import java.util.List;

public interface PetVaccinationService {
    PetVaccination replaceVaccination(Long petId, PetVaccinationDTO dto);
    List<PetVaccination> getVaccinations(Long petId);
    void deleteVaccination(Long vaccinationId);
}
package lk.ijse.gdse.back_end.service.impl;

import lk.ijse.gdse.back_end.dto.PetVaccinationDTO;
import lk.ijse.gdse.back_end.entity.Pet;
import lk.ijse.gdse.back_end.entity.PetVaccination;
import lk.ijse.gdse.back_end.repository.PetRepository;
import lk.ijse.gdse.back_end.repository.PetVaccinationRepository;
import lk.ijse.gdse.back_end.service.PetVaccinationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PetVaccinationServiceImpl implements PetVaccinationService {
    private final PetVaccinationRepository petVaccinationRepository;
    private final PetRepository petRepository;

    @Override
    public PetVaccination replaceVaccination(Long petId, PetVaccinationDTO dto) {
        Pet pet = petRepository.findById(petId)
                .orElseThrow(() -> new RuntimeException("Pet not found with id: " + petId));

        PetVaccination vaccination;

        if (dto.getPetVaccinationId() != null) {
            vaccination = petVaccinationRepository.findById(dto.getPetVaccinationId())
                    .orElse(new PetVaccination());
        } else {
            vaccination = new PetVaccination();
        }

        vaccination.setPet(pet);
        vaccination.setVaccineName(dto.getVaccineName());
        vaccination.setDateGiven(dto.getDateGiven());
        vaccination.setDueDate(dto.getDueDate());

        return petVaccinationRepository.save(vaccination);
    }

    @Override
    public List<PetVaccination> getVaccinations(Long petId) {
        Pet pet = petRepository.findById(petId)
                .orElseThrow(() -> new RuntimeException("Pet not found with id: " + petId));
        return petVaccinationRepository.findByPet(pet);
    }

    @Override
    public void deleteVaccination(Long vaccinationId) {
        PetVaccination vaccination = petVaccinationRepository.findById(vaccinationId)
                .orElseThrow(() -> new RuntimeException("Vaccination not found with id: " + vaccinationId));
        petVaccinationRepository.delete(vaccination);
    }
}

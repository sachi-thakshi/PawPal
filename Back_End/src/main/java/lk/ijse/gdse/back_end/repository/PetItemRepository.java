package lk.ijse.gdse.back_end.repository;

import lk.ijse.gdse.back_end.entity.PetItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PetItemRepository  extends JpaRepository<PetItem, Long>{
    List<PetItem> findByPetItemCategory(String category);
    List<PetItem> findByPetItemNameContainingIgnoreCase(String keyword);
    List<PetItem> findByPetItemPriceLessThan(double price);
}

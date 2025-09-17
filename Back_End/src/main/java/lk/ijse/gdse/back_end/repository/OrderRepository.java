package lk.ijse.gdse.back_end.repository;

import lk.ijse.gdse.back_end.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUserId(Long orderId);
    List<Order> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);

}

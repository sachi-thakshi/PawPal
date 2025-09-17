package lk.ijse.gdse.back_end.repository;

import lk.ijse.gdse.back_end.entity.Role;
import lk.ijse.gdse.back_end.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    List<User> findByRole(Role role);
    boolean existsByEmail(String email);

    @Query("SELECT COUNT(u) FROM User u WHERE MONTH(u.createdAt) = :month AND YEAR(u.createdAt) = :year")
    long countUsersByMonth(@Param("month") int month, @Param("year") int year);
}

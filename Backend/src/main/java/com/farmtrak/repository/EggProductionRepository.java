package com.farmtrak.repository;

import com.farmtrak.model.EggProduction;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface EggProductionRepository extends JpaRepository<EggProduction, Long> {
    List<EggProduction> findByDate(LocalDate date);
    Optional<EggProduction> findByFlockIdAndDate(Long flockId, LocalDate date);
    List<EggProduction> findByUserEmail(String userEmail);
    List<EggProduction> findByUserEmailAndDate(String userEmail, LocalDate date);
    Optional<EggProduction> findByFlockIdAndDateAndUserEmail(Long flockId, LocalDate date, String userEmail);
}

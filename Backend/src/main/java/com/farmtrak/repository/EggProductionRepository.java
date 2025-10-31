package com.farmtrak.repository;

import com.farmtrak.model.EggProduction;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface EggProductionRepository extends BaseRepository<EggProduction, Long> {
    List<EggProduction> findByUserEmailAndDate(String userEmail, LocalDate date);
    Optional<EggProduction> findByFlockIdAndDateAndUserEmail(Long flockId, LocalDate date, String userEmail);
}
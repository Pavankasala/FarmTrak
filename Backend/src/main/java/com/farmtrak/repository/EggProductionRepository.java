package com.farmtrak.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import com.farmtrak.model.EggProduction;

public interface EggProductionRepository extends BaseRepository<EggProduction, Long> {
    List<EggProduction> findByUserEmailAndDate(String userEmail, LocalDate date);
    List<EggProduction> findByUserEmail(String userEmail);
    Optional<EggProduction> findByFlockIdAndDateAndUserEmail(Long flockId, LocalDate date, String userEmail);
}
package com.farmtrak.controllers;

import com.farmtrak.model.EggProduction;
import com.farmtrak.repository.EggProductionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/eggs")
@CrossOrigin(origins = "https://pavankasala.github.io")
public class EggProductionController extends BaseController<EggProduction, Long> {

    private final EggProductionRepository eggRepo;
    private final Logger logger = LoggerFactory.getLogger(EggProductionController.class);

    @Autowired
    public EggProductionController(EggProductionRepository eggRepo) {
        super(eggRepo, (existing, updated) -> {
            existing.setFlockId(updated.getFlockId());
            existing.setCount(updated.getCount());
            existing.setDate(updated.getDate());
        });
        this.eggRepo = eggRepo;
    }

    @PostMapping
    public EggProduction saveProduction(@RequestBody EggProduction eggProduction,
                                        @RequestParam(name = "merge", defaultValue = "false") boolean merge,
                                        @RequestHeader("X-User-Email") String userEmail) {
        if (eggProduction.getDate() == null) {
            eggProduction.setDate(LocalDate.now());
        }
        eggProduction.setUserEmail(userEmail);

        Optional<EggProduction> existing = eggRepo.findByFlockIdAndDateAndUserEmail(
                eggProduction.getFlockId(), eggProduction.getDate(), userEmail);

        if (existing.isPresent()) {
            EggProduction existingProd = existing.get();
            if (merge) {
                existingProd.setCount(existingProd.getCount() + eggProduction.getCount());
            } else {
                existingProd.setCount(eggProduction.getCount());
            }
            return eggRepo.save(existingProd);
        }
        return eggRepo.save(eggProduction);
    }

    @GetMapping("/today")
    public List<EggProduction> getTodayProduction(@RequestHeader("X-User-Email") String userEmail) {
        return eggRepo.findByUserEmailAndDate(userEmail, LocalDate.now());
    }

    @GetMapping("/exists")
    public boolean checkIfExists(@RequestParam Long flockId, @RequestParam String date,
                                 @RequestHeader("X-User-Email") String userEmail) {
        LocalDate localDate = LocalDate.parse(date);
        return eggRepo.findByFlockIdAndDateAndUserEmail(flockId, localDate, userEmail).isPresent();
    }
}
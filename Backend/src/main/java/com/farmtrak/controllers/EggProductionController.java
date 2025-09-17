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
public class EggProductionController {

    private final EggProductionRepository eggRepo;
    private final Logger logger = LoggerFactory.getLogger(EggProductionController.class);

    @Autowired
    public EggProductionController(EggProductionRepository eggRepo) {
        this.eggRepo = eggRepo;
    }

    // Save new or update existing (with merge option)
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

        EggProduction result;
        if (existing.isPresent()) {
            EggProduction existingProd = existing.get();
            if (merge) {
                existingProd.setCount(existingProd.getCount() + eggProduction.getCount());
            } else {
                existingProd.setCount(eggProduction.getCount());
            }
            result = eggRepo.save(existingProd);
            logger.info("Updated EggProduction: id={}, flockId={}, count={}, date={}, userEmail={}",
                    result.getId(), result.getFlockId(), result.getCount(), result.getDate(), result.getUserEmail());
        } else {
            result = eggRepo.save(eggProduction);
            logger.info("Saved new EggProduction: id={}, flockId={}, count={}, date={}, userEmail={}",
                    result.getId(), result.getFlockId(), result.getCount(), result.getDate(), result.getUserEmail());
        }

        return result;
    }

    @PutMapping("/{id}")
    public EggProduction updateProduction(@PathVariable Long id, @RequestBody EggProduction updated,
                                          @RequestHeader("X-User-Email") String userEmail) {
        return eggRepo.findById(id)
                .map(prod -> {
                    if (!prod.getUserEmail().equals(userEmail)) {
                        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not authorized to update this record.");
                    }
                    prod.setFlockId(updated.getFlockId());
                    prod.setCount(updated.getCount());
                    prod.setDate(updated.getDate());
                    return eggRepo.save(prod);
                })
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "EggProduction not found"));
    }

    @DeleteMapping("/{id}")
    public void deleteProduction(@PathVariable Long id, @RequestHeader("X-User-Email") String userEmail) {
        EggProduction prod = eggRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "EggProduction not found"));
        if (!prod.getUserEmail().equals(userEmail)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not authorized to delete this record.");
        }
        eggRepo.deleteById(id);
    }

    @GetMapping("/today")
    public List<EggProduction> getTodayProduction(@RequestHeader("X-User-Email") String userEmail) {
        return eggRepo.findByUserEmailAndDate(userEmail, LocalDate.now());
    }

    @GetMapping
    public List<EggProduction> getAll(@RequestHeader("X-User-Email") String userEmail) {
        return eggRepo.findByUserEmail(userEmail);
    }

    @GetMapping("/exists")
    public boolean checkIfExists(@RequestParam Long flockId, @RequestParam String date,
                                 @RequestHeader("X-User-Email") String userEmail) {
        LocalDate localDate = LocalDate.parse(date);
        return eggRepo.findByFlockIdAndDateAndUserEmail(flockId, localDate, userEmail).isPresent();
    }
}
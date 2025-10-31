package com.farmtrak.controllers;

import com.farmtrak.model.Flock;
import com.farmtrak.repository.FlockRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;

@RestController
@RequestMapping("/api/flocks")
@CrossOrigin(origins = "https://pavankasala.github.io")
public class FlockController extends BaseController<Flock, Long> {

    @Autowired
    public FlockController(FlockRepository repository) {
        super(repository, (existing, updated) -> {
            existing.setAge(updated.getAge());
            existing.setNumBirds(updated.getNumBirds());
            existing.setBirdType(updated.getBirdType());
            existing.setCustomBird(updated.getCustomBird());
            if (updated.getStartDate() != null) {
                existing.setStartDate(updated.getStartDate());
            }
        });
    }

    @Override
    @PostMapping
    public Flock create(@RequestBody Flock flock, @RequestHeader("X-User-Email") String userEmail) {
        if (flock.getStartDate() == null) {
            flock.setStartDate(LocalDate.now());
        }
        return super.create(flock, userEmail);
    }
}
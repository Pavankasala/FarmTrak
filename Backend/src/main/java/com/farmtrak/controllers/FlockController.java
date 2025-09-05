package com.farmtrak.controllers;

import com.farmtrak.model.Flock;
import com.farmtrak.repository.FlockRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/flocks")
public class FlockController {

    @Autowired
    private FlockRepository flockRepository;

    // 🔹 Get all flocks for a user
    @GetMapping
    public List<Flock> getFlocks(@RequestHeader("X-User-Email") String userEmail) {
        return flockRepository.findByUserEmail(userEmail);
    }

    // 🔹 Add new flock
    @PostMapping
    public Flock addFlock(@RequestHeader("X-User-Email") String userEmail, @RequestBody Flock flock) {
        flock.setUserEmail(userEmail);

        // Auto-set startDate if not provided
        if (flock.getStartDate() == null) {
            flock.setStartDate(LocalDate.now());
        }

        return flockRepository.save(flock);
    }

    // 🔹 Update flock
    @PutMapping("/{id}")
    public Flock updateFlock(
            @RequestHeader("X-User-Email") String userEmail,
            @PathVariable Long id,
            @RequestBody Flock updatedFlock) {

        return flockRepository.findById(id).map(flock -> {
            if (!flock.getUserEmail().equals(userEmail)) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not allowed");
            }

            flock.setAge(updatedFlock.getAge());
            flock.setNumBirds(updatedFlock.getNumBirds());
            flock.setBirdType(updatedFlock.getBirdType());
            flock.setCustomBird(updatedFlock.getCustomBird());

            // Only update startDate if a new one is provided
            if (updatedFlock.getStartDate() != null) {
                flock.setStartDate(updatedFlock.getStartDate());
            }

            return flockRepository.save(flock);
        }).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Flock not found"));
    }

    // 🔹 Delete flock
    @DeleteMapping("/{id}")
    public String deleteFlock(@RequestHeader("X-User-Email") String userEmail, @PathVariable Long id) {
        Flock flock = flockRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Flock not found"));

        if (!flock.getUserEmail().equals(userEmail)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not allowed");
        }

        flockRepository.delete(flock);
        return "Flock deleted successfully!";
    }
}

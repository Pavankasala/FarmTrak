package com.farmtrak.controllers;

import java.time.LocalDate;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.farmtrak.model.Flock;
import com.farmtrak.repository.FlockRepository;

import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/api/flocks")
@CrossOrigin(origins = "https://pavankasala.github.io")
public class FlockController {

    private final FlockRepository flockRepo;

    @Autowired
    public FlockController(FlockRepository flockRepo) {
        this.flockRepo = flockRepo;
    }

    @GetMapping
    public List<Flock> getAll(HttpServletRequest request) {
        String userEmail = (String) request.getAttribute("userEmail");
        return flockRepo.findByUserEmail(userEmail);
    }

    @PostMapping
    public Flock create(@RequestBody Flock flock, HttpServletRequest request) {
        String userEmail = (String) request.getAttribute("userEmail");
        flock.setUserEmail(userEmail);
        if (flock.getStartDate() == null) {
            flock.setStartDate(LocalDate.now());
        }
        return flockRepo.save(flock);
    }

    @PutMapping("/{id}")
    public Flock update(@PathVariable Long id, @RequestBody Flock updated, HttpServletRequest request) {
        String userEmail = (String) request.getAttribute("userEmail");
        return flockRepo.findById(id)
                .map(existing -> {
                    if (!existing.getUserEmail().equals(userEmail)) {
                        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
                    }
                    existing.setAge(updated.getAge());
                    existing.setNumBirds(updated.getNumBirds());
                    existing.setBirdType(updated.getBirdType());
                    existing.setCustomBird(updated.getCustomBird());
                    if (updated.getStartDate() != null) {
                        existing.setStartDate(updated.getStartDate());
                    }
                    return flockRepo.save(existing);
                })
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Flock not found"));
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id, HttpServletRequest request) {
        String userEmail = (String) request.getAttribute("userEmail");
        Flock flock = flockRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Flock not found"));
        if (!flock.getUserEmail().equals(userEmail)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }
        flockRepo.deleteById(id);
    }
}
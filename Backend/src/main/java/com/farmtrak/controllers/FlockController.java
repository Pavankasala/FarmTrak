//Backend\src\main\java\com\farmtrak\controllers\FlockController.java
package com.farmtrak.controllers;

import com.farmtrak.exception.ResourceNotFoundException; // Import the custom exception
import com.farmtrak.model.Flock;
import com.farmtrak.repository.FlockRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/flocks")
public class FlockController {

    private final FlockRepository repo;

    public FlockController(FlockRepository repo) {
        this.repo = repo;
    }

    // GET all flocks
    @GetMapping
    public List<Flock> getAllFlocks(@RequestHeader("X-User-Email") String userEmail) {
        return repo.findByUserEmail(userEmail);
    }

    // POST
    @PostMapping
    public Flock addFlock(@RequestHeader("X-User-Email") String userEmail, @RequestBody Flock flock) {
        flock.setUserEmail(userEmail);
        return repo.save(flock);
    }

    // PUT
    @PutMapping("/{id}")
    public ResponseEntity<Flock> updateFlock(@PathVariable Long id,
                                            @RequestHeader("X-User-Email") String userEmail,
                                            @RequestBody Flock updatedFlock) {
        Flock existingFlock = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Flock not found with id: " + id));

        if (!existingFlock.getUserEmail().equals(userEmail)) {
            return ResponseEntity.status(403).build();
        }

        existingFlock.setType(updatedFlock.getType());
        existingFlock.setQuantity(updatedFlock.getQuantity());
        existingFlock.setAge(updatedFlock.getAge());

        final Flock savedFlock = repo.save(existingFlock);
        return ResponseEntity.ok(savedFlock);
    }

    // DELETE
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFlock(@PathVariable Long id,
                                            @RequestHeader("X-User-Email") String userEmail) {
        Flock flock = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Flock not found with id: " + id));

        if (!flock.getUserEmail().equals(userEmail)) {
            return ResponseEntity.status(403).build();
        }

        repo.delete(flock);
        return ResponseEntity.noContent().build();
    }
}
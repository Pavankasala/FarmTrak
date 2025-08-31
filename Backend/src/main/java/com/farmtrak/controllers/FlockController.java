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
    public List<Flock> getAllFlocks(@RequestParam("userEmail") String userEmail) {
        return repo.findByUserEmail(userEmail);
    }

    // GET a specific flock by ID
    @GetMapping("/{id}")
    public ResponseEntity<Flock> getFlockById(@PathVariable Long id) {
        Flock flock = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Flock not found with id: " + id));
        return ResponseEntity.ok(flock);
    }

    // POST a new flock
    @PostMapping
    public Flock addFlock(@RequestBody Flock flock) {
        return repo.save(flock);
    }

    // PUT (update) an existing flock
    @PutMapping("/{id}")
    public ResponseEntity<Flock> updateFlock(@PathVariable Long id, @RequestBody Flock updatedFlock, @RequestParam String userEmail) {
        // First, find the existing flock or throw an exception if not found
        Flock existingFlock = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Flock not found with id: " + id));

        // Ensure the user trying to update is the owner of the flock
        if (!existingFlock.getUserEmail().equals(userEmail)) {
            return ResponseEntity.status(403).build(); // Forbidden
        }

        // Update the fields, ensuring userEmail is not changed
        existingFlock.setType(updatedFlock.getType());
        existingFlock.setQuantity(updatedFlock.getQuantity());
        existingFlock.setAge(updatedFlock.getAge());
        existingFlock.setUserEmail(existingFlock.getUserEmail()); // Ensure userEmail is not changed

        // Save the updated flock and return it
        final Flock savedFlock = repo.save(existingFlock);
        return ResponseEntity.ok(savedFlock);
    }

    // DELETE a flock
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFlock(@PathVariable Long id) {
        // First, check if the flock exists. If not, findById will throw the exception.
        Flock flock = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Flock not found with id: " + id));

        // If it exists, delete it
        repo.delete(flock);
        return ResponseEntity.noContent().build(); // Return 204 No Content on successful deletion
    }
}
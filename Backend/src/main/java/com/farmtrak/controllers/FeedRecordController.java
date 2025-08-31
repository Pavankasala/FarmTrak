// Backend/src/main/java/com/farmtrak/controllers/FeedRecordController.java
package com.farmtrak.controllers;

import com.farmtrak.exception.ResourceNotFoundException;
import com.farmtrak.model.FeedRecord;
import com.farmtrak.repository.FeedRecordRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/feedRecords")
public class FeedRecordController {

    private final FeedRecordRepository repo;

    public FeedRecordController(FeedRecordRepository repo) {
        this.repo = repo;
    }

    // GET all feed records for a flock + user
    @GetMapping
    public List<FeedRecord> getFeedRecords(@RequestParam Long flockId, @RequestParam String userEmail) {
        return repo.findByFlockIdAndUserEmail(flockId, userEmail);
    }

    // GET one record
    @GetMapping("/{id}")
    public ResponseEntity<FeedRecord> getFeedRecord(@PathVariable Long id) {
        FeedRecord record = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Feed record not found with id: " + id));
        return ResponseEntity.ok(record);
    }

    // POST new record
    @PostMapping
    public FeedRecord addFeedRecord(@RequestBody FeedRecord record) {
        return repo.save(record);
    }

    // PUT update record
    @PutMapping("/{id}")
    public ResponseEntity<FeedRecord> updateFeedRecord(@PathVariable Long id, @RequestBody FeedRecord updated) {
        FeedRecord existing = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Feed record not found with id: " + id));

        existing.setNumBirds(updated.getNumBirds());
        existing.setBirdType(updated.getBirdType());
        existing.setTotalFeedGiven(updated.getTotalFeedGiven());
        existing.setUnit(updated.getUnit());
        existing.setDaysLasted(updated.getDaysLasted());
        existing.setFeedPerDay(updated.getFeedPerDay());
        existing.setFeedPerBird(updated.getFeedPerBird());
        // Keep flockId & userEmail unchanged

        return ResponseEntity.ok(repo.save(existing));
    }

    // DELETE record
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFeedRecord(@PathVariable Long id) {
        FeedRecord record = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Feed record not found with id: " + id));
        repo.delete(record);
        return ResponseEntity.noContent().build();
    }
}

package com.farmtrak.controllers;

import com.farmtrak.model.FeedRecord;
import com.farmtrak.repository.FeedRecordRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/feed-records")
@CrossOrigin(origins = "https://pavankasala.github.io") // More specific CORS
public class FeedRecordController {

    @Autowired
    private FeedRecordRepository repo;

    @GetMapping
    public List<FeedRecord> getAllRecords(@RequestHeader("X-User-Email") String userEmail) {
        return repo.findByUserEmail(userEmail);
    }

    @PostMapping
    public FeedRecord createRecord(@RequestBody FeedRecord record, @RequestHeader("X-User-Email") String userEmail) {
        record.setUserEmail(userEmail);
        return repo.save(record);
    }

    @PutMapping("/{id}")
    public FeedRecord updateRecord(@PathVariable Long id, @RequestBody FeedRecord updatedRecord, @RequestHeader("X-User-Email") String userEmail) {
        return repo.findById(id).map(record -> {
            if (!record.getUserEmail().equals(userEmail)) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not authorized to update this record.");
            }
            record.setBirdName(updatedRecord.getBirdName());
            record.setNumBirds(updatedRecord.getNumBirds());
            record.setTotalFeedGiven(updatedRecord.getTotalFeedGiven());
            record.setDaysLasted(updatedRecord.getDaysLasted());
            return repo.save(record);
        }).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Record not found"));
    }

    @DeleteMapping("/{id}")
    public void deleteRecord(@PathVariable Long id, @RequestHeader("X-User-Email") String userEmail) {
        FeedRecord record = repo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Record not found"));

        if (!record.getUserEmail().equals(userEmail)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not authorized to delete this record.");
        }
        repo.deleteById(id);
    }
}
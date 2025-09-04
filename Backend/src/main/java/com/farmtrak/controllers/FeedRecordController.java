package com.farmtrak.controllers;

import com.farmtrak.model.FeedRecord;
import com.farmtrak.repository.FeedRecordRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/feedRecords")
public class FeedRecordController {

    @Autowired
    private FeedRecordRepository feedRecordRepository;

    // Get records by flock
    @GetMapping
    public ResponseEntity<List<FeedRecord>> getFeedRecords(
            @RequestHeader("X-User-Email") String userEmail,
            @RequestParam Long flockId) {

        List<FeedRecord> records = feedRecordRepository.findByUserEmailAndFlockId(userEmail, flockId);
        return ResponseEntity.ok(records);
    }

    // Add record
    @PostMapping
    public ResponseEntity<?> addFeedRecord(
            @RequestHeader("X-User-Email") String userEmail,
            @RequestBody FeedRecord feedRecord) {

        // Basic validation
        if (feedRecord.getNumBirds() <= 0 || feedRecord.getTotalFeedGiven() <= 0 || feedRecord.getDaysLasted() <= 0) {
            return ResponseEntity.badRequest().body("Invalid input values.");
        }

        feedRecord.setUserEmail(userEmail);
        FeedRecord saved = feedRecordRepository.save(feedRecord);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    // Update record
    @PutMapping("/{id}")
public ResponseEntity<?> updateFeedRecord(
        @RequestHeader("X-User-Email") String userEmail,
        @PathVariable Long id,
        @RequestBody FeedRecord updatedRecord) {

    return feedRecordRepository.findById(id).map(record -> {
        if (!record.getUserEmail().equals(userEmail)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Not allowed");
        }

        // Basic validation
        if (updatedRecord.getNumBirds() <= 0 || updatedRecord.getTotalFeedGiven() <= 0 || updatedRecord.getDaysLasted() <= 0) {
            return ResponseEntity.badRequest().body("Invalid input values.");
        }

        record.setFlockId(updatedRecord.getFlockId());
        record.setNumBirds(updatedRecord.getNumBirds());
        record.setBirdType(updatedRecord.getBirdType());
        record.setCustomBird(updatedRecord.getBirdType().equals("other") ? updatedRecord.getCustomBird() : "");
        record.setBirdName(updatedRecord.getBirdType().equals("other") ? updatedRecord.getCustomBird() : updatedRecord.getBirdType());
        record.setTotalFeedGiven(updatedRecord.getTotalFeedGiven());
        record.setUnit(updatedRecord.getUnit());
        record.setDaysLasted(updatedRecord.getDaysLasted());
        record.setFeedPerDay(updatedRecord.getFeedPerDay());
        record.setFeedPerBird(updatedRecord.getFeedPerBird());
        record.setDate(updatedRecord.getDate());

        FeedRecord saved = feedRecordRepository.save(record);
        return ResponseEntity.ok(saved);
    }).orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body("Record not found"));
}

}

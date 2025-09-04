// Backend/src/main/java/com/farmtrak/controllers/FeedRecordController.java
package com.farmtrak.controllers;

import com.farmtrak.model.FeedRecord;
import com.farmtrak.repository.FeedRecordRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
    public ResponseEntity<FeedRecord> addFeedRecord(
            @RequestHeader("X-User-Email") String userEmail,
            @RequestBody FeedRecord feedRecord) {

        feedRecord.setUserEmail(userEmail);
        FeedRecord saved = feedRecordRepository.save(feedRecord);
        return ResponseEntity.ok(saved);
    }

    // Update record
   @PutMapping("/{id}")
    public ResponseEntity<FeedRecord> updateFeedRecord(
            @RequestHeader("X-User-Email") String userEmail,
            @PathVariable Long id,
            @RequestBody FeedRecord updatedRecord) {

        return feedRecordRepository.findById(id).map(record -> {
            if (!record.getUserEmail().equals(userEmail)) {
                return new ResponseEntity<FeedRecord>(HttpStatus.FORBIDDEN);
            }

            record.setFlockId(updatedRecord.getFlockId());
            record.setNumBirds(updatedRecord.getNumBirds());
            record.setBirdType(updatedRecord.getBirdType());
            record.setTotalFeedGiven(updatedRecord.getTotalFeedGiven());
            record.setUnit(updatedRecord.getUnit());
            record.setDaysLasted(updatedRecord.getDaysLasted());
            record.setFeedPerDay(updatedRecord.getFeedPerDay());
            record.setFeedPerBird(updatedRecord.getFeedPerBird());

            FeedRecord saved = feedRecordRepository.save(record);
            return ResponseEntity.ok(saved);
        }).orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
        }
}

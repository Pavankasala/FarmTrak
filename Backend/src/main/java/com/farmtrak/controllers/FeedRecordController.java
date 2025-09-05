package com.farmtrak.controllers;

import com.farmtrak.model.FeedRecord;
import com.farmtrak.repository.FeedRecordRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/feedRecords")
public class FeedRecordController {

    @Autowired
    private FeedRecordRepository feedRecordRepository;

    // ✅ Get records by flock (for a user)
    @GetMapping
    public List<FeedRecord> getFeedRecords(
            @RequestHeader("X-User-Email") String userEmail,
            @RequestParam Long flockId) {
        return feedRecordRepository.findByUserEmailAndFlockId(userEmail, flockId);
    }

    // ✅ Add new record
    @PostMapping
    public FeedRecord addFeedRecord(
            @RequestHeader("X-User-Email") String userEmail,
            @RequestBody FeedRecord feedRecord) {

        if (feedRecord.getNumBirds() <= 0 || feedRecord.getTotalFeedGiven() <= 0 || feedRecord.getDaysLasted() <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid input values.");
        }

        feedRecord.setUserEmail(userEmail);
        return feedRecordRepository.save(feedRecord);
    }

    // ✅ Update record
    @PutMapping("/{id}")
    public FeedRecord updateFeedRecord(
            @RequestHeader("X-User-Email") String userEmail,
            @PathVariable Long id,
            @RequestBody FeedRecord updatedRecord) {

        return feedRecordRepository.findById(id).map(record -> {
            if (!record.getUserEmail().equals(userEmail)) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not allowed");
            }

            if (updatedRecord.getNumBirds() <= 0 || updatedRecord.getTotalFeedGiven() <= 0 || updatedRecord.getDaysLasted() <= 0) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid input values.");
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

            return feedRecordRepository.save(record);
        }).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Record not found"));
    }

    // ✅ Delete record
    @DeleteMapping("/{id}")
    public String deleteFeedRecord(
            @RequestHeader("X-User-Email") String userEmail,
            @PathVariable Long id) {

        FeedRecord record = feedRecordRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Record not found"));

        if (!record.getUserEmail().equals(userEmail)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not allowed");
        }

        feedRecordRepository.delete(record);
        return "Feed record deleted successfully!";
    }
}

package com.farmtrak.controllers;

import com.farmtrak.model.FeedRecord;
import com.farmtrak.repository.FeedRecordRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/feedRecords")
public class FeedRecordController {

    @Autowired
    private FeedRecordRepository feedRecordRepository;

    // ✅ Get all feed records for a user
    @GetMapping
    public List<FeedRecord> getFeedRecords(@RequestHeader("X-User-Email") String userEmail) {
        return feedRecordRepository.findByUserEmail(userEmail);
    }

    // ✅ Add new feed record with flockId
    @PostMapping
    public FeedRecord addFeedRecord(
            @RequestHeader("X-User-Email") String userEmail,
            @RequestBody FeedRecord feedRecord) {

        if (feedRecord.getNumBirds() <= 0 || feedRecord.getTotalFeedGiven() <= 0 || feedRecord.getDaysLasted() <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid input values.");
        }

        // Assign next prediction number
        Integer maxPrediction = feedRecordRepository.findMaxPredictionNumberByUserEmail(userEmail).orElse(0);
        feedRecord.setPredictionNumber(maxPrediction + 1);

        feedRecord.setUserEmail(userEmail);

        // ✅ Set date to today if not provided
        if (feedRecord.getDate() == null) {
            feedRecord.setDate(LocalDate.now());
        }

        // ✅ Calculate feedPerDay & feedPerBird
        feedRecord.setFeedPerDay(feedRecord.getTotalFeedGiven() / feedRecord.getDaysLasted());
        feedRecord.setFeedPerBird(feedRecord.getTotalFeedGiven() / feedRecord.getNumBirds() / feedRecord.getDaysLasted());

        // Save first to generate an ID
        FeedRecord savedRecord = feedRecordRepository.save(feedRecord);

        // Use the ID as flockId
        savedRecord.setFlockId(savedRecord.getId());
        return feedRecordRepository.save(savedRecord);
    }

    // ✅ Update feed record
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

            // Keep predictionNumber & flockId unchanged
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

    // ✅ Delete feed record
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

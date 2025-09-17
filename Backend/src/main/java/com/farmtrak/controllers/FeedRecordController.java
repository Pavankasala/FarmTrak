package com.farmtrak.controllers;

import com.farmtrak.model.FeedRecord;
import com.farmtrak.repository.FeedRecordRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/feed-records")
@CrossOrigin(origins = "https://pavankasala.github.io")
public class FeedRecordController extends BaseController<FeedRecord, Long> {

    @Autowired
    public FeedRecordController(FeedRecordRepository repository) {
        super(repository, (existing, updated) -> {
            existing.setBirdName(updated.getBirdName());
            existing.setNumBirds(updated.getNumBirds());
            existing.setTotalFeedGiven(updated.getTotalFeedGiven());
            existing.setDaysLasted(updated.getDaysLasted());
        });
    }
}
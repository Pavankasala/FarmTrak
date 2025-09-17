package com.farmtrak.controllers;

import com.farmtrak.model.Revenue;
import com.farmtrak.repository.RevenueRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/revenue")
public class RevenueController extends BaseController<Revenue, Long> {

    @Autowired
    public RevenueController(RevenueRepository repository) {
        super(repository, (existing, updated) -> {
            existing.setCategory(updated.getCategory());
            existing.setAmount(updated.getAmount());
            existing.setDate(updated.getDate());
            existing.setNotes(updated.getNotes());
        });
    }
}
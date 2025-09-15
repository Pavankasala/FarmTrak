package com.farmtrak.controllers;

import com.farmtrak.model.Revenue;
import com.farmtrak.repository.RevenueRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;

@RestController
@RequestMapping("/api/revenue")
public class RevenueController {

    @Autowired
    private RevenueRepository revenueRepository;

    @PostMapping
    public Revenue saveRevenue(@RequestHeader("X-User-Email") String userEmail, @RequestBody Revenue revenue) {
        revenue.setUserEmail(userEmail);
        return revenueRepository.save(revenue);
    }

    @GetMapping
    public List<Revenue> getAllRevenue(@RequestHeader("X-User-Email") String userEmail) {
        return revenueRepository.findByUserEmail(userEmail);
    }

    @PutMapping("/{id}")
    public Revenue updateRevenue(@PathVariable Long id, @RequestHeader("X-User-Email") String userEmail, @RequestBody Revenue updatedRevenue) {
        return revenueRepository.findById(id).map(rev -> {
            if (!rev.getUserEmail().equals(userEmail)) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not authorized");
            }
            rev.setCategory(updatedRevenue.getCategory());
            rev.setAmount(updatedRevenue.getAmount());
            rev.setDate(updatedRevenue.getDate());
            rev.setNotes(updatedRevenue.getNotes());
            return revenueRepository.save(rev);
        }).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Revenue not found"));
    }

    @DeleteMapping("/{id}")
    public String deleteRevenue(@PathVariable Long id, @RequestHeader("X-User-Email") String userEmail) {
        Revenue revenue = revenueRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Revenue not found"));
        if (!revenue.getUserEmail().equals(userEmail)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not authorized");
        }
        revenueRepository.deleteById(id);
        return "Revenue deleted successfully!";
    }
}
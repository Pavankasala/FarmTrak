package com.farmtrak.controllers;

import com.farmtrak.model.Expense;
import com.farmtrak.repository.ExpenseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/expenses")
@CrossOrigin(origins = "https://pavankasala.github.io")
public class ExpenseController extends BaseController<Expense, Long> {

    @Autowired
    public ExpenseController(ExpenseRepository repository) {
        super(repository, (existing, updated) -> {
            existing.setCategory(updated.getCategory());
            existing.setAmount(updated.getAmount());
            existing.setDate(updated.getDate());
            existing.setNotes(updated.getNotes());
            existing.setPaid(updated.isPaid());
        });
    }
}
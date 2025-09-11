// src/main/java/com/farmtrak/controllers/ExpenseController.java
package com.farmtrak.controllers;

import com.farmtrak.model.Expense;
import com.farmtrak.repository.ExpenseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;

@RestController
@RequestMapping("/api/expenses")
@CrossOrigin(origins = "https://pavankasala.github.io") // allow your deployed frontend
public class ExpenseController {

    @Autowired
    private ExpenseRepository expenseRepository;

    @PostMapping
    public Expense saveExpense(@RequestHeader("X-User-Email") String userEmail, @RequestBody Expense expense) {
        expense.setUserEmail(userEmail);
        return expenseRepository.save(expense);
    }

    @GetMapping
    public List<Expense> getAllExpenses(@RequestHeader("X-User-Email") String userEmail) {
        return expenseRepository.findByUserEmail(userEmail);
    }

    @PutMapping("/{id}")
    public Expense updateExpense(@PathVariable Long id, @RequestHeader("X-User-Email") String userEmail, @RequestBody Expense updatedExpense) {
        return expenseRepository.findById(id).map(exp -> {
            if (!exp.getUserEmail().equals(userEmail)) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not authorized");
            }
            exp.setCategory(updatedExpense.getCategory());
            exp.setAmount(updatedExpense.getAmount());
            exp.setDate(updatedExpense.getDate());
            exp.setNotes(updatedExpense.getNotes());
            exp.setPaid(updatedExpense.isPaid());
            return expenseRepository.save(exp);
        }).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Expense not found"));
    }

    @DeleteMapping("/{id}")
    public String deleteExpense(@PathVariable Long id, @RequestHeader("X-User-Email") String userEmail) {
        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Expense not found"));
        if (!expense.getUserEmail().equals(userEmail)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not authorized");
        }
        expenseRepository.deleteById(id);
        return "Expense deleted successfully!";
    }
}

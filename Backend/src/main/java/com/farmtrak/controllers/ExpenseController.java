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
public class ExpenseController {

    @Autowired
    private ExpenseRepository expenseRepository;

    // Save a new expense
    @PostMapping
    public Expense saveExpense(@RequestHeader("X-User-Email") String userEmail, @RequestBody Expense expense) {
        expense.setUserEmail(userEmail);
        return expenseRepository.save(expense);
    }

    // Get all expenses for a user
    @GetMapping
    public List<Expense> getAllExpenses(@RequestHeader("X-User-Email") String userEmail) {
        return expenseRepository.findByUserEmail(userEmail);
    }
    
    // ✅ Update an expense by ID
    @PutMapping("/{id}")
    public Expense updateExpense(@PathVariable Long id, @RequestHeader("X-User-Email") String userEmail, @RequestBody Expense updatedExpense) {
        return expenseRepository.findById(id).map(exp -> {
            if (!exp.getUserEmail().equals(userEmail)) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not authorized to update this expense.");
            }
            exp.setCategory(updatedExpense.getCategory());
            exp.setAmount(updatedExpense.getAmount());
            exp.setDate(updatedExpense.getDate());
            exp.setNotes(updatedExpense.getNotes());
            exp.setPaid(updatedExpense.isPaid());
            return expenseRepository.save(exp);
        }).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Expense not found with id " + id));
    }

    // ✅ Delete an expense by ID
    @DeleteMapping("/{id}")
    public String deleteExpense(@PathVariable Long id, @RequestHeader("X-User-Email") String userEmail) {
        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Expense not found with id " + id));

        if (!expense.getUserEmail().equals(userEmail)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not authorized to delete this expense.");
        }
        expenseRepository.deleteById(id);
        return "Expense deleted successfully!";
    }
}

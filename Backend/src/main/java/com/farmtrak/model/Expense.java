package com.farmtrak.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
public class Expense implements BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String category;
    private double amount;
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate date;
    private String notes;
    private boolean paid;
    private String userEmail;

    // Constructors, Getters, and Setters...
    public Expense() {}
    public Expense(String category, double amount, LocalDate date, String notes, boolean paid, String userEmail) {
        this.category = category; this.amount = amount; this.date = date; this.notes = notes; this.paid = paid; this.userEmail = userEmail;
    }
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public double getAmount() { return amount; }
    public void setAmount(double amount) { this.amount = amount; }
    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public boolean isPaid() { return paid; }
    public void setPaid(boolean paid) { this.paid = paid; }
    @Override
    public String getUserEmail() { return userEmail; }
    @Override
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }
}
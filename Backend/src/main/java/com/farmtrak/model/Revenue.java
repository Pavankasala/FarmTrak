package com.farmtrak.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
public class Revenue implements BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String category;
    private double amount;
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate date;
    private String notes;
    private String userEmail;

    // Getters and Setters...
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
    @Override
    public String getUserEmail() { return userEmail; }
    @Override
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }
}
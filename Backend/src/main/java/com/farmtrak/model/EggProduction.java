//Backend\src\main\java\com\farmtrak\model\EggProduction.java
package com.farmtrak.model;

import jakarta.persistence.*;
import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonFormat;

@Entity
public class EggProduction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long flockId;

    private int count;
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate date;

    private String userEmail;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getFlockId() { return flockId; }
    public void setFlockId(Long flockId) { this.flockId = flockId; }

    public int getCount() { return count; }
    public void setCount(int count) { this.count = count; }

    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }

    public String getUserEmail() { return userEmail; }
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }
}

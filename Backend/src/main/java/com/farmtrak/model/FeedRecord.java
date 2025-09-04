// Backend/src/main/java/com/farmtrak/model/FeedRecord.java
package com.farmtrak.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@NoArgsConstructor @AllArgsConstructor
public class FeedRecord {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long flockId;      // link to flock
    private String userEmail;  // owner

    private int numBirds;
    private String birdType;
    private double totalFeedGiven;
    private String unit;
    private int daysLasted;
    private LocalDate date; // Date of the feed record

    private double feedPerDay;   // kg per day
    private double feedPerBird;  // g per bird

    // Getters & setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getFlockId() { return flockId; }
    public void setFlockId(Long flockId) { this.flockId = flockId; }

    public String getUserEmail() { return userEmail; }
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }

    public int getNumBirds() { return numBirds; }
    public void setNumBirds(int numBirds) { this.numBirds = numBirds; }

    public String getBirdType() { return birdType; }
    public void setBirdType(String birdType) { this.birdType = birdType; }

    public double getTotalFeedGiven() { return totalFeedGiven; }
    public void setTotalFeedGiven(double totalFeedGiven) { this.totalFeedGiven = totalFeedGiven; }

    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }

    public int getDaysLasted() { return daysLasted; }
    public void setDaysLasted(int daysLasted) { this.daysLasted = daysLasted; }

    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }

    public double getFeedPerDay() { return feedPerDay; }
    public void setFeedPerDay(double feedPerDay) { this.feedPerDay = feedPerDay; }

    public double getFeedPerBird() { return feedPerBird; }
    public void setFeedPerBird(double feedPerBird) { this.feedPerBird = feedPerBird; }
}

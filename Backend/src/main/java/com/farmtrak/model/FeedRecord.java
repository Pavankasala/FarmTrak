// Backend/src/main/java/com/farmtrak/model/FeedRecord.java
package com.farmtrak.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@NoArgsConstructor
@AllArgsConstructor
public class FeedRecord {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String userEmail;  // owner
    private int predictionNumber; // Track which prediction it is

    private int numBirds;
    private String birdType;
    private String customBird;
    private String birdName;
    private double totalFeedGiven;
    private String unit;
    private int daysLasted;
    
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private LocalDate date;

    private double feedPerDay;
    private double feedPerBird;

    private Long flockId; // ✅ NEW: real flockId

    // Getters & setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUserEmail() { return userEmail; }
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }

    public int getPredictionNumber() { return predictionNumber; }
    public void setPredictionNumber(int predictionNumber) { this.predictionNumber = predictionNumber; }

    public int getNumBirds() { return numBirds; }
    public void setNumBirds(int numBirds) { this.numBirds = numBirds; }

    public String getBirdType() { return birdType; }
    public void setBirdType(String birdType) { this.birdType = birdType; }

    public String getCustomBird() { return customBird; }
    public void setCustomBird(String customBird) { this.customBird = customBird; }

    public String getBirdName() { return birdName; }
    public void setBirdName(String birdName) { this.birdName = birdName; }

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

    public Long getFlockId() { return flockId; }
    public void setFlockId(Long flockId) { this.flockId = flockId; }
}

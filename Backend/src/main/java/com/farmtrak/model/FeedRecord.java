package com.farmtrak.model;

import jakarta.persistence.*;

@Entity
public class FeedRecord implements BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String userEmail; 
    private String birdName;
    private int numBirds;
    private double totalFeedGiven;
    private int daysLasted;

    // Getters and Setters...
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getBirdName() { return birdName; }
    public void setBirdName(String birdName) { this.birdName = birdName; }
    public int getNumBirds() { return numBirds; }
    public void setNumBirds(int numBirds) { this.numBirds = numBirds; }
    public double getTotalFeedGiven() { return totalFeedGiven; }
    public void setTotalFeedGiven(double totalFeedGiven) { this.totalFeedGiven = totalFeedGiven; }
    public int getDaysLasted() { return daysLasted; }
    public void setDaysLasted(int daysLasted) { this.daysLasted = daysLasted; }
    @Override
    public String getUserEmail() { return userEmail; }
    @Override
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }
}
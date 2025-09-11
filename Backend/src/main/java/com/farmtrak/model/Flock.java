// Backend/src/main/java/com/farmtrak/model/Flock.java
package com.farmtrak.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
public class Flock {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private int numBirds;
    private String birdType;
    private String customBird;
    private LocalDate startDate;
    private int age;
    private String userEmail;
    // ----- Getters & Setters -----
    public Long getId() {
        return id;
    }
    public void setId(Long id) {
        this.id = id;
    }

    public int getNumBirds() {
        return numBirds;
    }
    public void setNumBirds(int numBirds) {
        this.numBirds = numBirds;
    }

    public String getBirdType() {
        return birdType;
    }
    public void setBirdType(String birdType) {
        this.birdType = birdType;
    }

    public String getCustomBird() {
        return customBird;
    }
    public void setCustomBird(String customBird) {
        this.customBird = customBird;
    }

    public LocalDate getStartDate() {
        return startDate;
    }
    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public int getAge() {
        return age;
    }
    public void setAge(int age) {
        this.age = age;
    }

    public String getUserEmail() {
        return userEmail;
    }
    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }
}

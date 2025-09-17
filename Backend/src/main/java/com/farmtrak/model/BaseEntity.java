package com.farmtrak.model;

// This interface ensures all our main models have user email handling
public interface BaseEntity {
    String getUserEmail();
    void setUserEmail(String userEmail);
}
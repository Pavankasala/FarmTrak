package com.farmtrak.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDateTime;

@Entity
@Table(name = "otps")
public class OTP {

    @Id
    private String email; // Primary key: one OTP per email

    private String code;
    private LocalDateTime expiryTime;
    private boolean verified;

    public OTP() {}

    public OTP(String email, String code, LocalDateTime expiryTime, boolean verified) {
        this.email = email;
        this.code = code;
        this.expiryTime = expiryTime;
        this.verified = verified;
    }

    // Getters & Setters
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public LocalDateTime getExpiryTime() { return expiryTime; }
    public void setExpiryTime(LocalDateTime expiryTime) { this.expiryTime = expiryTime; }
    public boolean isVerified() { return verified; }
    public void setVerified(boolean verified) { this.verified = verified; }
}

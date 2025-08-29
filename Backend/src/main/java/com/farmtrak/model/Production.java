//Backend\src\main\java\com\farmtrak\model\Production.java
package com.farmtrak.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class Production {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long flockId;
    private int count;

    private LocalDateTime date;

    // Getters and setters
    public Long getId() {
        return id;
    }

    public Long getFlockId() {
        return flockId;
    }

    public void setFlockId(Long flockId) {
        this.flockId = flockId;
    }

    public int getCount() {
        return count;
    }

    public void setCount(int count) {
        this.count = count;
    }

    public LocalDateTime getDate() {
        return date;
    }

    public void setDate(LocalDateTime date) {
        this.date = date;
    }
}

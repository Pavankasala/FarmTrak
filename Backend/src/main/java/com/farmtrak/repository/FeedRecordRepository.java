// Backend/src/main/java/com/farmtrak/repository/FeedRecordRepository.java
package com.farmtrak.repository;

import com.farmtrak.model.FeedRecord;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FeedRecordRepository extends JpaRepository<FeedRecord, Long> {
    List<FeedRecord> findByFlockIdAndUserEmail(Long flockId, String userEmail);
}

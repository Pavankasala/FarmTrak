package com.farmtrak.repository;

import com.farmtrak.model.FeedRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface FeedRecordRepository extends JpaRepository<FeedRecord, Long> {
    List<FeedRecord> findByUserEmailAndFlockId(String userEmail, Long flockId);
}

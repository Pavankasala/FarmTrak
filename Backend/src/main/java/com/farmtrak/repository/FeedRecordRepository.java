package com.farmtrak.repository;

import com.farmtrak.model.FeedRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface FeedRecordRepository extends JpaRepository<FeedRecord, Long> {
    List<FeedRecord> findByUserEmail(String userEmail); 
}
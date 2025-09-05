package com.farmtrak.repository;

import com.farmtrak.model.FeedRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface FeedRecordRepository extends JpaRepository<FeedRecord, Long> {

    List<FeedRecord> findByUserEmail(String userEmail);

    @Query("SELECT MAX(f.predictionNumber) FROM FeedRecord f WHERE f.userEmail = :email")
    Optional<Integer> findMaxPredictionNumberByUserEmail(@Param("email") String email);
}

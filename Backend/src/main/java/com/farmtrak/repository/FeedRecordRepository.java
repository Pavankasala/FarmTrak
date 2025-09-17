package com.farmtrak.repository;

import com.farmtrak.model.FeedRecord;
import org.springframework.stereotype.Repository;

@Repository
public interface FeedRecordRepository extends BaseRepository<FeedRecord, Long> {
}
package com.farmtrak.repository;

import com.farmtrak.model.Revenue;
import org.springframework.stereotype.Repository;

@Repository
public interface RevenueRepository extends BaseRepository<Revenue, Long> {
}
package com.farmtrak.repository;

import com.farmtrak.model.Revenue;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RevenueRepository extends JpaRepository<Revenue, Long> {
    List<Revenue> findByUserEmail(String userEmail);
}
package com.farmtrak.repository;

import com.farmtrak.model.Expense;
import org.springframework.stereotype.Repository;

@Repository
public interface ExpenseRepository extends BaseRepository<Expense, Long> {
}
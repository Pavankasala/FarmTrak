//Backend\src\main\java\com\farmtrak\repository\ExpenseRepository.java
package com.farmtrak.repository;

import com.farmtrak.model.Expense;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, Long> {
    List<Expense> findByUserEmail(String userEmail);
}

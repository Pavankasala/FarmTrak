//Backend\src\main\java\com\farmtrak\repository\FlockRepository.java
package com.farmtrak.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.farmtrak.model.Flock;

public interface FlockRepository extends JpaRepository<Flock, Long> {
    List<Flock> findByUserEmail(String userEmail);
}

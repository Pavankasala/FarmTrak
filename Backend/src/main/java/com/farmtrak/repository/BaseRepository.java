package com.farmtrak.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.NoRepositoryBean;
import java.util.List;

@NoRepositoryBean // Tells Spring this is an interface to be extended, not implemented directly
public interface BaseRepository<T, ID> extends JpaRepository<T, ID> {
    List<T> findByUserEmail(String userEmail);
}
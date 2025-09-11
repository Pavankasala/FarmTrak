package com.farmtrak.repository;

import com.farmtrak.model.VerificationToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.Optional;

public interface VerificationTokenRepository extends JpaRepository<VerificationToken, Long> {

    @Query("SELECT t FROM VerificationToken t WHERE t.email = :email AND t.code = :code AND t.expiresAt > :now AND t.used = false")
    Optional<VerificationToken> findValidToken(@Param("email") String email, @Param("code") String code, @Param("now") Instant now);
}

package com.farmtrak.repository;

import com.farmtrak.model.OTP;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OTPRepository extends JpaRepository<OTP, String> {
    OTP findByEmailAndCode(String email, String code);
}

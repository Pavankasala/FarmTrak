// AuthService.java - Everything in one place!
package com.farmtrak.service;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.farmtrak.model.OTP;
import com.farmtrak.model.User;
import com.farmtrak.repository.OTPRepository;
import com.farmtrak.repository.UserRepository;

@Service
public class AuthService {
    @Autowired private OTPRepository otpRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private EmailService emailService;

    // PASSWORD HELPERS (right here in the same file!)
    private String makePasswordSafe(String password) {
        return "SAFE_" + password.hashCode();
    }
    
    private boolean isPasswordCorrect(String userPassword, String savedPassword) {
        return makePasswordSafe(userPassword).equals(savedPassword);
    }

    // 1. REGISTER: Send code to email
    public void sendCodeToEmail(String email, String username) {
        if (userRepository.findByEmail(email).isPresent()) {
            throw new RuntimeException("Email already used!");
        }
        
        String code = String.valueOf(100000 + new Random().nextInt(900000));
        LocalDateTime expires = LocalDateTime.now().plusMinutes(10);
        OTP otp = new OTP(email, code, expires, false);
        otpRepository.save(otp);
        
        emailService.sendVerificationEmail(email, username, code);
    }

    // 2. VERIFY: Check code and create user
    public boolean createUserWithCode(String email, String code, String username, String password) {
        OTP otp = otpRepository.findByEmailAndCode(email, code);
        
        if (otp != null && !otp.isVerified() && otp.getExpiryTime().isAfter(LocalDateTime.now())) {
            otp.setVerified(true);
            otpRepository.save(otp);
            
            User user = new User();
            user.setEmail(email);
            user.setUsername(username);
            user.setPassword(makePasswordSafe(password)); // Use helper directly!
            userRepository.save(user);
            
            return true;
        }
        return false;
    }

    // 3. LOGIN: Check email and password
    public Optional<User> checkLogin(String email, String password) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (isPasswordCorrect(password, user.getPassword())) { // Use helper directly!
                return Optional.of(user);
            }
        }
        return Optional.empty();
    }
}
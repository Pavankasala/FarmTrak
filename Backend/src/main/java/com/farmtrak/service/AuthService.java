package com.farmtrak.service;

import com.farmtrak.model.OTP;
import com.farmtrak.model.User; // Import User model
import com.farmtrak.repository.OTPRepository;
import com.farmtrak.repository.UserRepository; // Import UserRepository
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;

@Service
public class AuthService {

    @Autowired
    private OTPRepository otpRepository;

    @Autowired
    private UserRepository userRepository; // Inject UserRepository

    @Autowired
    private EmailService emailService;

    private static final int OTP_LENGTH = 6;
    private static final int OTP_EXPIRATION_MINUTES = 10;

    /**
     * Handles user registration: checks if user exists, then sends OTP.
     */
    public void register(String email, String username) {
        if (userRepository.findByEmail(email).isPresent()) {
            throw new IllegalStateException("User with this email already exists. Please log in.");
        }
        sendVerification(email, username);
    }

    /**
     * Handles user login: checks if user exists and returns them.
     * For passwordless login, this is sufficient.
     */
    public Optional<User> login(String email) {
        return userRepository.findByEmail(email);
    }

    public void sendVerification(String email, String username) {
        // ... (keep existing sendVerification logic)
        // Note: In a real app, you might want to store the username with the OTP.
    }

    public boolean verifyAndCreateUser(String email, String code, String username) {
        OTP otp = otpRepository.findByEmailAndCode(email, code);

        if (otp != null && !otp.isVerified() && otp.getExpiryTime().isAfter(LocalDateTime.now())) {
            otp.setVerified(true);
            otpRepository.save(otp);

            // Create and save the new user
            User newUser = new User();
            newUser.setEmail(email);
            newUser.setUsername(username);
            userRepository.save(newUser);

            return true;
        }
        return false;
    }

    // ... (keep generateNumericOTP method)
}
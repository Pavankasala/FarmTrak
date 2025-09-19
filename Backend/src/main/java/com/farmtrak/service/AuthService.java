package com.farmtrak.service;

import com.farmtrak.model.OTP;
import com.farmtrak.model.User;
import com.farmtrak.repository.OTPRepository;
import com.farmtrak.repository.UserRepository;
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
    private UserRepository userRepository;

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
     */
    public Optional<User> login(String email) {
        return userRepository.findByEmail(email);
    }

    /**
     * Generates, saves, and emails a new OTP for verification.
     */
    public void sendVerification(String email, String username) {
        String code = generateNumericOTP(OTP_LENGTH);
        LocalDateTime expiryTime = LocalDateTime.now().plusMinutes(OTP_EXPIRATION_MINUTES);

        // Save or update the OTP for this email
        OTP otp = new OTP(email, code, expiryTime, false);
        otpRepository.save(otp);

        // Send the email
        emailService.sendVerificationEmail(email, username, code);
    }

    /**
     * Verifies the OTP and creates the user if valid.
     */
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

    /**
     * Generates a random numeric string of a given length.
     */
    private String generateNumericOTP(int length) {
        Random random = new Random();
        StringBuilder otp = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            otp.append(random.nextInt(10));
        }
        return otp.toString();
    }
}
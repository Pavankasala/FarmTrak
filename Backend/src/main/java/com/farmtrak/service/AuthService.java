package com.farmtrak.service;

import com.farmtrak.model.OTP;
import com.farmtrak.repository.OTPRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Random;

@Service
public class AuthService {

    @Autowired
    private OTPRepository otpRepository;

    @Autowired
    private EmailService emailService;

    private static final int OTP_LENGTH = 6;
    private static final int OTP_EXPIRATION_MINUTES = 10;

    public void sendVerification(String email, String username) {
        String code = generateNumericOTP();
        LocalDateTime expiry = LocalDateTime.now().plusMinutes(OTP_EXPIRATION_MINUTES);

        OTP otp = new OTP(email, code, expiry, false);
        otpRepository.save(otp);

        emailService.sendVerificationEmail(email, username, code);
    }

    public boolean verifyEmail(String email, String code) {
        OTP otp = otpRepository.findByEmailAndCode(email, code);

        if (otp != null && !otp.isVerified() && otp.getExpiryTime().isAfter(LocalDateTime.now())) {
            otp.setVerified(true);
            otpRepository.save(otp);
            return true;
        }
        return false;
    }

    private String generateNumericOTP() {
        Random random = new Random();
        StringBuilder otp = new StringBuilder();
        for (int i = 0; i < OTP_LENGTH; i++) {
            otp.append(random.nextInt(10));
        }
        return otp.toString();
    }
}

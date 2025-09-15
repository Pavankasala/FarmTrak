package com.farmtrak.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    /**
     * Sends a verification email with the OTP.
     * Throws RuntimeException if email sending fails.
     */
    public void sendVerificationEmail(String toEmail, String username, String verifyCode) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(toEmail);
            message.setSubject("Your 6-Digit Verification Code");

            String textContent = "Hello, " + username + "\n\n"
                    + "Your verification code is: " + verifyCode + "\n\n"
                    + "Please enter this code to verify your email address.\n\n"
                    + "Thank you,\nFarmTrak Team";

            message.setText(textContent);

            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Failed to send verification email to " + toEmail + ": " + e.getMessage());
            throw new RuntimeException("Failed to send verification email");
        }
    }
}

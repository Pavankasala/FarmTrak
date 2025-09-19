package com.farmtrak.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;
    
    @Value("${MAIL_USERNAME}")
    private String fromEmail;

    /**
     * Sends a verification email with the OTP.
     * Throws RuntimeException if email sending fails.
     */
    public void sendVerificationEmail(String toEmail, String username, String verifyCode) {
        try {
            System.out.println("📧 Attempting to send email to: " + toEmail);
            System.out.println("📧 From email: " + fromEmail);
            System.out.println("📧 Verification code: " + verifyCode);
            
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);  // 🔧 THIS WAS MISSING!
            message.setTo(toEmail);
            message.setSubject("FarmTrak - Your 6-Digit Verification Code");

            String textContent = "Hello, " + username + "\n\n"
                    + "Your verification code is: " + verifyCode + "\n\n"
                    + "Please enter this code to verify your email address.\n\n"
                    + "Thank you,\nFarmTrak Team";

            message.setText(textContent);

            mailSender.send(message);
            System.out.println("✅ Email sent successfully to: " + toEmail);
            
        } catch (Exception e) {
            System.err.println("❌ Failed to send verification email to " + toEmail + ": " + e.getMessage());
            e.printStackTrace(); // Print full stack trace
            throw new RuntimeException("Failed to send verification email: " + e.getMessage());
        }
    }
}
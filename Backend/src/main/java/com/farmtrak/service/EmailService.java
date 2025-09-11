package com.farmtrak.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

/**
 * Uses Spring Boot's JavaMailSender for sending emails.
 * Simplified for easy understanding by a beginner.
 */
@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendVerificationEmail(String toEmail, String username, String verifyCode) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("your_gmail_address@gmail.com"); // should match application.properties MAIL_USERNAME
        message.setTo(toEmail);
        message.setSubject("Your 6-Digit Verification Code");

        String textContent = "Hello, " + username + "\n\n"
                + "Your verification code is: " + verifyCode + "\n\n"
                + "Please enter this code to verify your email address.\n\n"
                + "Thank you,\nDoctors Point Team";

        message.setText(textContent);

        mailSender.send(message);
    }
}

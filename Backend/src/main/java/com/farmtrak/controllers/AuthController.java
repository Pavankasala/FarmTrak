package com.farmtrak.controllers;

import com.farmtrak.model.OTP;
import com.farmtrak.repository.OTPRepository;  // ← ADD THIS
import com.farmtrak.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;  // ← ADD THIS
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;
    @Autowired
    private OTPRepository otpRepository;  // ← ADD THIS

    // 1. STEP 1: Send verification code
    @PostMapping("/register")
    public ResponseEntity<Map<String, String>> register(@RequestBody Map<String, String> data) {
        try {
            authService.sendCodeToEmail(data.get("email"), data.get("username"));
            return ResponseEntity.ok(Map.of("message", "Code sent to your email!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // 2. STEP 2: Verify code and create account
    @PostMapping("/verify")
    public ResponseEntity<Map<String, Object>> verify(@RequestBody Map<String, String> data) {
        boolean success = authService.createUserWithCode(
                data.get("email"),
                data.get("code"),
                data.get("username"),
                data.get("password")
        );

        if (success) {
            return ResponseEntity.ok(Map.of(
                    "status", "success",
                    "email", data.get("email"),
                    "token", "user_" + System.currentTimeMillis()
            ));
        } else {
            return ResponseEntity.badRequest().body(Map.of("status", "error", "message", "Wrong code!"));
        }
    }

    // 3. LOGIN: Check password
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> data) {
        var user = authService.checkLogin(data.get("email"), data.get("password"));

        if (user.isPresent()) {
            return ResponseEntity.ok(Map.of(
                    "status", "success",
                    "email", user.get().getEmail(),
                    "token", "user_" + System.currentTimeMillis()
            ));
        } else {
            return ResponseEntity.badRequest().body(Map.of("status", "error", "message", "Wrong email or password!"));
        }
    }

    // 4. DEBUG: Check OTP codes in database
    @GetMapping("/debug-otp/{email}")
    public ResponseEntity<Map<String, Object>> debugOtp(@PathVariable String email) {
        List<OTP> otps = otpRepository.findAll().stream()
                .filter(otp -> otp.getEmail().equals(email))
                .toList();

        List<Map<String, Object>> otpInfo = otps.stream().map(otp -> {
            Map<String, Object> info = new HashMap<>();
            info.put("email", otp.getEmail());
            info.put("code", otp.getCode());
            info.put("verified", otp.isVerified());
            info.put("expiryTime", otp.getExpiryTime().toString());
            info.put("isExpired", otp.getExpiryTime().isBefore(LocalDateTime.now()));
            return info;
        }).toList();

        return ResponseEntity.ok(Map.of("otps", otpInfo));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        authService.sendPasswordResetCode(email); // Reuse your existing email logic!
        return ResponseEntity.ok(Map.of("message", "Reset code sent to your email!"));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String code = request.get("code");
        String newPassword = request.get("newPassword");
        authService.resetPassword(email, code, newPassword); // Similar to verification!
        return ResponseEntity.ok(Map.of("message", "Password updated successfully!"));
    }
}

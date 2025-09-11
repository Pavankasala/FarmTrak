package com.farmtrak.controllers;

import com.farmtrak.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/send-verification")
    public ResponseEntity<Map<String, String>> sendVerification(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String username = body.get("username");

        authService.sendVerification(email, username);

        return ResponseEntity.ok(Map.of("message", "Verification code sent successfully."));
    }

    @PostMapping("/verify-email")
    public ResponseEntity<Map<String, Object>> verifyEmail(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String code = body.get("code");

        boolean isValid = authService.verifyEmail(email, code);

        return ResponseEntity.ok(Map.of(
                "verified", isValid,
                "message", isValid ? "Email verified successfully." : "Invalid or expired OTP."
        ));
    }
}

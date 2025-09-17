package com.farmtrak.controllers;

import com.farmtrak.model.User;
import com.farmtrak.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth") // Group auth routes
public class AuthController {

    @Autowired
    private AuthService authService;

    // Endpoint for new user registration
    @PostMapping("/register")
    public ResponseEntity<Map<String, String>> register(@RequestBody Map<String, String> body) {
        try {
            authService.register(body.get("email"), body.get("username"));
            return ResponseEntity.ok(Map.of("message", "Verification code sent successfully."));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", e.getMessage()));
        }
    }

    // Endpoint to verify OTP and create user
    @PostMapping("/verify")
    public ResponseEntity<Map<String, Object>> verify(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String code = body.get("code");
        String username = body.get("username"); // Pass username to create the user

        boolean isValid = authService.verifyAndCreateUser(email, code, username);

        if (isValid) {
            return ResponseEntity.ok(Map.of(
                    "status", "success",
                    "email", email,
                    "token", "email-dummy-token-" + System.currentTimeMillis()
            ));
        }
        return ResponseEntity.status(401).body(Map.of("status", "error", "message", "Invalid or expired OTP."));
    }

    // New endpoint for existing user login
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        Optional<User> user = authService.login(email);

        if (user.isPresent()) {
            return ResponseEntity.ok(Map.of(
                    "status", "success",
                    "email", user.get().getEmail(),
                    "token", "email-dummy-token-" + System.currentTimeMillis()
            ));
        }
        return ResponseEntity.status(404).body(Map.of("status", "error", "message", "User not found. Please sign up."));
    }
}
package com.farmtrak.controllers;
import com.farmtrak.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    @Autowired private AuthService authService;

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
}
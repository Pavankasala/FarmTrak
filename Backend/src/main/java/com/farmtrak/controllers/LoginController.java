package com.farmtrak.controllers;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.json.jackson2.JacksonFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class LoginController {

    private static final String CLIENT_ID = "1091305199358-8dmcca126f88clk710fkvkmu5r5l08ap.apps.googleusercontent.com";

    // ----------- Google Login only -----------
    @PostMapping("/google-login")
    public ResponseEntity<Map<String, String>> googleLogin(@RequestBody TokenRequest tokenRequest) {
        try {
            JacksonFactory jacksonFactory = JacksonFactory.getDefaultInstance();
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                    GoogleNetHttpTransport.newTrustedTransport(), jacksonFactory)
                    .setAudience(Collections.singletonList(CLIENT_ID))
                    .build();

            GoogleIdToken idToken = verifier.verify(tokenRequest.getToken());
            if (idToken != null) {
                GoogleIdToken.Payload payload = idToken.getPayload();
                String email = payload.getEmail();
                String name = (String) payload.get("name");

                // Here you can save user in DB if you want persistent login

                Map<String, String> response = new HashMap<>();
                response.put("status", "success");
                response.put("email", email);
                response.put("name", name);
                response.put("token", "google-dummy-token-" + System.currentTimeMillis());
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Collections.singletonMap("message", "Invalid Google token"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("message", "Google login failed: " + e.getMessage()));
        }
    }

    // Inner class for token request
    public static class TokenRequest {
        private String token;
        public String getToken() { return token; }
        public void setToken(String token) { this.token = token; }
    }
}

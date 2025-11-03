package com.farmtrak;

import java.io.IOException;
import java.io.InputStream;

import javax.annotation.PostConstruct;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.core.io.ClassPathResource;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;

@SpringBootApplication
public class FarmTrakApplication {

    public static void main(String[] args) {
        SpringApplication.run(FarmTrakApplication.class, args);
    }

    @PostConstruct
    public void initializeFirebase() {
        try {
            if (FirebaseApp.getApps().isEmpty()) {
                InputStream serviceAccount;
                
                // Try to load from environment variable first (for production)
                String serviceAccountKey = System.getenv("FIREBASE_SERVICE_ACCOUNT_KEY");
                if (serviceAccountKey != null) {
                    serviceAccount = new java.io.ByteArrayInputStream(serviceAccountKey.getBytes());
                } else {
                    // Fallback to local file (for development)
                    serviceAccount = new ClassPathResource("serviceAccountKey.json").getInputStream();
                }
                
                GoogleCredentials credentials = GoogleCredentials.fromStream(serviceAccount);
                FirebaseOptions options = FirebaseOptions.builder()
                    .setCredentials(credentials)
                    .build();
                    
                FirebaseApp.initializeApp(options);
                System.out.println("Firebase initialized successfully");
            }
        } catch (IOException e) {
            System.err.println("Failed to initialize Firebase: " + e.getMessage());
            throw new RuntimeException("Firebase initialization failed", e);
        }
    }
}

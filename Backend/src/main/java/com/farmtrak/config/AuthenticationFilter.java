package com.farmtrak.config;

import java.io.IOException;

import org.springframework.stereotype.Component;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseToken;

import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class AuthenticationFilter implements Filter {

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;
        
        String path = httpRequest.getRequestURI();
        
        // Skip authentication for login endpoint and health checks
        if (path.equals("/api/google-login") || path.equals("/") || path.equals("/health") || 
            path.startsWith("/api/auth/") || path.contains("favicon")) {
            chain.doFilter(request, response);
            return;
        }
        
        // Get Authorization header
        String authHeader = httpRequest.getHeader("Authorization");
        
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            httpResponse.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            httpResponse.setContentType("application/json");
            httpResponse.getWriter().write("{\"error\":\"Missing or invalid Authorization header\"}");
            return;
        }
        
        String idToken = authHeader.substring(7); // Remove "Bearer " prefix
        
        try {
            // Verify Firebase ID token
            FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(idToken);
            String userEmail = decodedToken.getEmail();
            
            if (userEmail != null) {
                request.setAttribute("userEmail", userEmail);
                chain.doFilter(request, response);
                return;
            }
            
        } catch (Exception e) {
            System.err.println("Firebase token verification failed: " + e.getMessage());
        }
        
        // If we reach here, authentication failed
        httpResponse.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        httpResponse.setContentType("application/json");
        httpResponse.getWriter().write("{\"error\":\"Invalid or expired Firebase token\"}");
    }
}
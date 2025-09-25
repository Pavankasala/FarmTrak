package com.farmtrak.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.HandlerInterceptor;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.Cookie;
import org.springframework.http.ResponseCookie;
import org.springframework.http.HttpHeaders;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("https://farmtrak.onrender.com", "https://pavankasala.github.io", "http://localhost:5173")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .exposedHeaders(HttpHeaders.SET_COOKIE)
                .allowCredentials(true);
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(new HandlerInterceptor() {
            @Override
            public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
                // Set security headers
                String uri = request.getRequestURI();
                if (uri.contains("/api/google-login")) {
                    // Relax COOP for login endpoint to avoid popup warning
                    response.setHeader("Cross-Origin-Embedder-Policy", "unsafe-none");
                    response.setHeader("X-Content-Type-Options", "nosniff");
                    response.setHeader("X-Frame-Options", "SAMEORIGIN");
                    response.setHeader("X-XSS-Protection", "1; mode=block");
                } else {
                    response.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
                    response.setHeader("Cross-Origin-Embedder-Policy", "unsafe-none");
                    response.setHeader("X-Content-Type-Options", "nosniff");
                    response.setHeader("X-Frame-Options", "SAMEORIGIN");
                    response.setHeader("X-XSS-Protection", "1; mode=block");
                }

                // Handle auth token in cookie
                if (uri.contains("/api/google-login")) {
                    String token = request.getHeader("Authorization");
                    if (token != null) {
                        ResponseCookie cookie = ResponseCookie.from("AUTH-TOKEN", token)
                            .httpOnly(true)
                            .secure(true)
                            .path("/")
                            .maxAge(24 * 60 * 60) // 24 hours
                            .sameSite("Strict")
                            .build();
                        response.setHeader(HttpHeaders.SET_COOKIE, cookie.toString());
                    }
                }
                return true;
            }
        });
    }
}
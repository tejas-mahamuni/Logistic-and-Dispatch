package com.logistic.security;

import jakarta.servlet.DispatcherType;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    // Allowed origins — React dev server + static file:// origin.
    // "null" covers pages opened directly from the filesystem (Origin: null).
    private static final List<String> ALLOWED_ORIGINS = List.of(
            "http://localhost:5173",
            "http://localhost:3000",
            "null"
    );

    private final JwtAuthFilter jwtAuthFilter;

    public SecurityConfig(JwtAuthFilter jwtAuthFilter) {
        this.jwtAuthFilter = jwtAuthFilter;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOriginPatterns(List.of(
            "http://localhost:*",
            "http://127.0.0.1:*",
            "https://*.trycloudflare.com",
            "https://*.onrender.com",
            "null"
        ));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setExposedHeaders(List.of("Authorization"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .headers(headers -> headers.frameOptions(frame -> frame.disable()))
            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // Allow dispatcher forwards and errors (essential for SPA index.html and error handling)
                .dispatcherTypeMatchers(DispatcherType.FORWARD, DispatcherType.ERROR).permitAll()

                // ---- Static Frontend & SPA routes (served by unified Fat-JAR) ----
                .requestMatchers(
                    "/",
                    "/index.html",
                    "/favicon.ico",
                    "/favicon.svg",
                    "/icons.svg",
                    "/assets/**",
                    "/web-forms/**",
                    "/*.js",
                    "/*.css",
                    "/*.png",
                    "/*.svg",
                    "/*.ico",
                    "/*.json"
                ).permitAll()
                .requestMatchers(
                    "/login",
                    "/register",
                    "/customer/**",
                    "/driver/**",
                    "/admin/**",
                    "/hub-manager/**",
                    "/dispatcher/**",
                    "/track/**",
                    "/orders/**"
                ).permitAll()

                // ---- Fully public APIs ----
                .requestMatchers("/api/v1/auth/**").permitAll()
                .requestMatchers("/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()

                // ---- Hubs: reads public so intake & onboarding forms can populate active hubs ----
                .requestMatchers(HttpMethod.GET,    "/api/v1/hubs", "/api/v1/hubs/**").permitAll()
                // Writes strictly for ADMIN
                .requestMatchers(HttpMethod.POST,   "/api/v1/hubs", "/api/v1/hubs/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT,    "/api/v1/hubs", "/api/v1/hubs/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PATCH,  "/api/v1/hubs", "/api/v1/hubs/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/v1/hubs", "/api/v1/hubs/**").hasRole("ADMIN")

                // ---- User Management strictly for ADMIN ----
                .requestMatchers("/api/v1/users", "/api/v1/users/**").hasRole("ADMIN")

                // ---- HTML forms test access (customers, drivers, vehicles, orders, assignments, reports) ----
                .requestMatchers("/api/v1/customers", "/api/v1/customers/**").permitAll()
                .requestMatchers("/api/v1/drivers", "/api/v1/drivers/**").permitAll()
                .requestMatchers("/api/v1/vehicles", "/api/v1/vehicles/**").permitAll()
                .requestMatchers("/api/v1/orders", "/api/v1/orders/**").permitAll()
                .requestMatchers("/api/v1/assignments", "/api/v1/assignments/**").permitAll()
                .requestMatchers("/api/v1/reports", "/api/v1/reports/**").permitAll()

                // ---- Everything else: authenticated ----
                .anyRequest().authenticated()
            )
            // JWT filter runs before Spring's username/password filter
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}

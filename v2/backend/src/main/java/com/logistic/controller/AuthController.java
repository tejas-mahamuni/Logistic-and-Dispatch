package com.logistic.controller;

import com.logistic.dao.CustomerRepository;
import com.logistic.dao.UserRepository;
import com.logistic.dto.auth.LoginRequest;
import com.logistic.dto.auth.LoginResponse;
import com.logistic.dto.auth.MeResponse;
import com.logistic.entity.Customer;
import com.logistic.entity.User;
import com.logistic.exception.DomainException;
import com.logistic.model.Role;
import com.logistic.security.JwtPrincipal;
import com.logistic.security.JwtProperties;
import com.logistic.security.JwtService;
import com.logistic.security.RefreshTokenService;
import com.logistic.services.AuthService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;
    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;
    private final JwtProperties jwtProperties;

    public AuthController(AuthService authService,
                          JwtService jwtService,
                          RefreshTokenService refreshTokenService,
                          UserRepository userRepository,
                          CustomerRepository customerRepository,
                          JwtProperties jwtProperties) {
        this.authService          = authService;
        this.jwtService           = jwtService;
        this.refreshTokenService  = refreshTokenService;
        this.userRepository       = userRepository;
        this.customerRepository   = customerRepository;
        this.jwtProperties        = jwtProperties;
    }

    // -------------------------------------------------------------------------
    // POST /api/v1/auth/login
    // -------------------------------------------------------------------------
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest req,
                                               HttpServletRequest  request,
                                               HttpServletResponse response) {
        AuthService.AuthUserDto authUser = authService.authenticate(req.username(), req.password());

        String accessToken  = jwtService.generateAccessToken(
                authUser.id(), authUser.username(), authUser.role(), authUser.hubId());
        String refreshToken = refreshTokenService.issue(
                authUser.id(), request.getRemoteAddr(), request.getHeader("User-Agent"));

        addRefreshCookie(response, refreshToken);

        return ResponseEntity.ok(new LoginResponse(
                accessToken,
                "Bearer",
                jwtProperties.getAccessTokenExpirationSeconds(),
                authUser.username(),
                authUser.role().name(),
                authUser.hubId()
        ));
    }

    // -------------------------------------------------------------------------
    // POST /api/v1/auth/refresh
    // -------------------------------------------------------------------------
    @PostMapping("/refresh")
    public ResponseEntity<LoginResponse> refresh(HttpServletRequest  request,
                                                 HttpServletResponse response) {
        String raw = extractRefreshCookie(request);
        if (raw == null) {
            throw new DomainException(HttpStatus.UNAUTHORIZED, "No refresh token cookie");
        }

        Long userId = refreshTokenService.getUserIdByRawToken(raw);
        String newRaw = refreshTokenService.rotate(raw, request.getRemoteAddr(), request.getHeader("User-Agent"));

        User user = userRepository.findById(userId).orElse(null);
        if (user != null) {
            String accessToken = jwtService.generateAccessToken(
                    user.getId(), user.getUsername(), user.getRole(), user.getHubId());

            addRefreshCookie(response, newRaw);

            return ResponseEntity.ok(new LoginResponse(
                    accessToken, "Bearer",
                    jwtProperties.getAccessTokenExpirationSeconds(),
                    user.getUsername(), user.getRole().name(), user.getHubId()
            ));
        }

        Customer customer = customerRepository.findById(userId)
                .orElseThrow(() -> new DomainException(HttpStatus.UNAUTHORIZED, "User or Customer not found"));

        String accessToken = jwtService.generateAccessToken(
                customer.getId(), customer.getPhone(), Role.CUSTOMER, null);

        addRefreshCookie(response, newRaw);

        return ResponseEntity.ok(new LoginResponse(
                accessToken, "Bearer",
                jwtProperties.getAccessTokenExpirationSeconds(),
                customer.getPhone(), Role.CUSTOMER.name(), null
        ));
    }

    // -------------------------------------------------------------------------
    // POST /api/v1/auth/logout
    // -------------------------------------------------------------------------
    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(HttpServletRequest  request,
                                                      HttpServletResponse response) {
        String raw = extractRefreshCookie(request);
        if (raw != null) {
            refreshTokenService.revokeByRawToken(raw);
        }
        clearRefreshCookie(response);
        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }

    // -------------------------------------------------------------------------
    // GET /api/v1/auth/me
    // -------------------------------------------------------------------------
    @GetMapping("/me")
    public ResponseEntity<MeResponse> me(@AuthenticationPrincipal JwtPrincipal principal) {
        if (principal == null) {
            throw new DomainException(HttpStatus.UNAUTHORIZED, "Unauthenticated session");
        }

        User user = userRepository.findById(principal.getUserId()).orElse(null);
        if (user != null) {
            return ResponseEntity.ok(new MeResponse(
                    user.getId(), user.getUsername(), user.getFullName(),
                    user.getRole().name(), user.getHubId()
            ));
        }

        Customer customer = customerRepository.findById(principal.getUserId())
                .orElseThrow(() -> new DomainException(HttpStatus.NOT_FOUND, "User or Customer not found"));

        return ResponseEntity.ok(new MeResponse(
                customer.getId(), customer.getPhone(), customer.getFullName(),
                Role.CUSTOMER.name(), null
        ));
    }

    // -------------------------------------------------------------------------
    // Cookie helpers
    // -------------------------------------------------------------------------

    private void addRefreshCookie(HttpServletResponse response, String rawToken) {
        Cookie cookie = new Cookie(jwtProperties.getCookieName(), rawToken);
        cookie.setHttpOnly(true);
        cookie.setSecure(false);
        cookie.setPath("/api/v1/auth");
        cookie.setMaxAge((int) jwtProperties.getRefreshTokenExpirationSeconds());
        response.addCookie(cookie);
    }

    private void clearRefreshCookie(HttpServletResponse response) {
        Cookie cookie = new Cookie(jwtProperties.getCookieName(), "");
        cookie.setHttpOnly(true);
        cookie.setPath("/api/v1/auth");
        cookie.setMaxAge(0);
        response.addCookie(cookie);
    }

    private String extractRefreshCookie(HttpServletRequest request) {
        if (request.getCookies() == null) return null;
        return Arrays.stream(request.getCookies())
                .filter(c -> jwtProperties.getCookieName().equals(c.getName()))
                .map(Cookie::getValue)
                .findFirst()
                .orElse(null);
    }
}

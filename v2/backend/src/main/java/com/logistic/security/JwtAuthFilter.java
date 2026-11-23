package com.logistic.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

/**
 * Reads the Authorization: Bearer <token> header, validates the JWT,
 * and injects an Authentication into the SecurityContext.
 *
 * We build the principal from the token claims directly (no DB round-trip per request).
 */
@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtService jwtService;

    public JwtAuthFilter(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain filterChain)
            throws ServletException, IOException {

        String header = request.getHeader("Authorization");
        if (header == null || !header.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = header.substring(7);
        try {
            Claims claims = jwtService.parseAndValidate(token);

            Long   userId   = jwtService.getUserId(claims);
            String username = claims.getSubject();
            String roleName = claims.get("role", String.class);
            Long   hubId    = jwtService.getHubId(claims);

            // Build a lightweight principal — no DB hit needed
            JwtPrincipal principal = new JwtPrincipal(userId, username, roleName, hubId);
            List<SimpleGrantedAuthority> authorities =
                    List.of(new SimpleGrantedAuthority("ROLE_" + roleName));

            UsernamePasswordAuthenticationToken auth =
                    new UsernamePasswordAuthenticationToken(principal, null, authorities);
            SecurityContextHolder.getContext().setAuthentication(auth);

        } catch (JwtException ex) {
            // Invalid token — let the request proceed unauthenticated;
            // Spring Security will return 401 if the endpoint requires auth.
            SecurityContextHolder.clearContext();
        }

        filterChain.doFilter(request, response);
    }
}

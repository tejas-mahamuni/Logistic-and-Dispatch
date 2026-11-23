package com.logistic.security;

import com.logistic.model.Role;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Date;

/**
 * Signs and validates HS256 access tokens.
 *
 * Access token claims:
 *   sub     → username
 *   userId  → User.id (Long)
 *   role    → Role enum name
 *   hubId   → User.hubId (Long, null for ADMIN/CUSTOMER)
 */
@Service
public class JwtService {

    private final SecretKey signingKey;
    private final JwtProperties props;

    public JwtService(JwtProperties props) {
        this.props = props;
        byte[] keyBytes = Base64.getDecoder().decode(
                props.getSecret().getBytes(StandardCharsets.UTF_8));
        this.signingKey = Keys.hmacShaKeyFor(keyBytes);
    }

    // -------------------------------------------------------------------------
    // Token generation
    // -------------------------------------------------------------------------

    public String generateAccessToken(Long userId, String username, Role role, Long hubId) {
        long nowMs  = System.currentTimeMillis();
        long expMs  = nowMs + props.getAccessTokenExpirationSeconds() * 1_000L;

        return Jwts.builder()
                .issuer(props.getIssuer())
                .subject(username)
                .claim("userId", userId)
                .claim("role",   role.name())
                .claim("hubId",  hubId)
                .issuedAt(new Date(nowMs))
                .expiration(new Date(expMs))
                .signWith(signingKey)
                .compact();
    }

    // -------------------------------------------------------------------------
    // Token validation
    // -------------------------------------------------------------------------

    /**
     * @return parsed Claims if token is valid.
     * @throws JwtException on any validation failure (expired, bad sig, malformed).
     */
    public Claims parseAndValidate(String token) {
        return Jwts.parser()
                .verifyWith(signingKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    // -------------------------------------------------------------------------
    // Claims helpers
    // -------------------------------------------------------------------------

    public Long getUserId(Claims claims) {
        return claims.get("userId", Long.class);
    }

    public Role getRole(Claims claims) {
        return Role.valueOf(claims.get("role", String.class));
    }

    public Long getHubId(Claims claims) {
        Object raw = claims.get("hubId");
        if (raw == null) return null;
        if (raw instanceof Long l) return l;
        if (raw instanceof Integer i) return i.longValue();
        return Long.parseLong(raw.toString());
    }
}

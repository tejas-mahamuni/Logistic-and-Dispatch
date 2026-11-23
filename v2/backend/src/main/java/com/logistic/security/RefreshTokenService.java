package com.logistic.security;

import com.logistic.dao.RefreshTokenRepository;
import com.logistic.entity.RefreshToken;
import com.logistic.exception.DomainException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.util.HexFormat;
import java.util.UUID;

/**
 * Issues, rotates, and revokes refresh tokens.
 */
@Service
public class RefreshTokenService {

    private final RefreshTokenRepository repo;
    private final JwtProperties props;

    public RefreshTokenService(RefreshTokenRepository repo, JwtProperties props) {
        this.repo  = repo;
        this.props = props;
    }

    // ---- Issue (on login) ----

    @Transactional
    public String issue(Long userId, String ip, String ua) {
        String raw = UUID.randomUUID().toString();
        persist(userId, raw);
        return raw;
    }

    // ---- Rotate (on /auth/refresh) ----

    @Transactional
    public String rotate(String rawToken, String ip, String ua) {
        String hash = sha256(rawToken);
        RefreshToken stored = repo.findByTokenHash(hash)
                .orElseThrow(() -> new DomainException(HttpStatus.UNAUTHORIZED, "Invalid refresh token"));

        if (stored.getExpiresAt().isBefore(Instant.now())) {
            repo.delete(stored);
            throw new DomainException(HttpStatus.UNAUTHORIZED, "Refresh token expired. Please log in again.");
        }

        // Remove old token
        Long userId = stored.getUserId();
        repo.delete(stored);

        // Issue new token
        String newRaw = UUID.randomUUID().toString();
        persist(userId, newRaw);

        return newRaw;
    }

    /** Looks up userId from a valid token hash — used by AuthController for the /refresh response. */
    @Transactional(readOnly = true)
    public Long getUserIdByRawToken(String rawToken) {
        return repo.findByTokenHash(sha256(rawToken))
                .map(RefreshToken::getUserId)
                .orElseThrow(() -> new DomainException(HttpStatus.UNAUTHORIZED, "Invalid refresh token"));
    }

    // ---- Revoke (on logout) ----

    @Transactional
    public void revokeByRawToken(String rawToken) {
        repo.findByTokenHash(sha256(rawToken)).ifPresent(repo::delete);
    }

    // ---- Helpers ----

    private RefreshToken persist(Long userId, String raw) {
        RefreshToken rt = new RefreshToken();
        rt.setUserId(userId);
        rt.setTokenHash(sha256(raw));
        rt.setExpiresAt(Instant.now().plusSeconds(props.getRefreshTokenExpirationSeconds()));
        return repo.save(rt);
    }

    public static String sha256(String input) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] hash = md.digest(input.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 not available", e);
        }
    }
}

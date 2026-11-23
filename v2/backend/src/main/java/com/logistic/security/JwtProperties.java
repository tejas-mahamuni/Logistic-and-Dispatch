package com.logistic.security;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * Binds app.jwt.* from application.yml.
 */
@Component
@ConfigurationProperties(prefix = "app.jwt")
public class JwtProperties {

    /** Base64-encoded 256-bit HMAC secret. Inject via APP_JWT_SECRET env var in production. */
    private String secret;

    private String issuer = "logistic-dispatch-v2";

    /** Access token lifetime in seconds (default 15 min). */
    private long accessTokenExpirationSeconds = 900;

    /** Refresh token lifetime in seconds (default 7 days). */
    private long refreshTokenExpirationSeconds = 604800;

    /** Name of the HttpOnly cookie that carries the refresh token. */
    private String cookieName = "refresh_token";

    // --- generated getters/setters ---

    public String getSecret() { return secret; }
    public void setSecret(String secret) { this.secret = secret; }

    public String getIssuer() { return issuer; }
    public void setIssuer(String issuer) { this.issuer = issuer; }

    public long getAccessTokenExpirationSeconds() { return accessTokenExpirationSeconds; }
    public void setAccessTokenExpirationSeconds(long v) { this.accessTokenExpirationSeconds = v; }

    public long getRefreshTokenExpirationSeconds() { return refreshTokenExpirationSeconds; }
    public void setRefreshTokenExpirationSeconds(long v) { this.refreshTokenExpirationSeconds = v; }

    public String getCookieName() { return cookieName; }
    public void setCookieName(String cookieName) { this.cookieName = cookieName; }
}

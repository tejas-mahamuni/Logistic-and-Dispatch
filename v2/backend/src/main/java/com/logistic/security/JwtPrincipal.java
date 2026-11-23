package com.logistic.security;

/**
 * Lightweight token-derived principal stored on the SecurityContext.
 * Avoids a DB lookup per request — all data comes from JWT claims.
 */
public class JwtPrincipal {

    private final Long   userId;
    private final String username;
    private final String role;
    private final Long   hubId;    // null for ADMIN and CUSTOMER

    public JwtPrincipal(Long userId, String username, String role, Long hubId) {
        this.userId   = userId;
        this.username = username;
        this.role     = role;
        this.hubId    = hubId;
    }

    public Long   getUserId()  { return userId; }
    public String getUsername(){ return username; }
    public String getRole()    { return role; }
    public Long   getHubId()   { return hubId; }

    @Override
    public String toString() {
        return username + "[" + role + (hubId != null ? ",hub=" + hubId : "") + "]";
    }
}

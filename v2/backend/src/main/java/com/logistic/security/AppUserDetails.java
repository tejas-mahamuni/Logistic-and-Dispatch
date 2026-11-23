package com.logistic.security;

import com.logistic.entity.Customer;
import com.logistic.entity.User;
import com.logistic.model.Role;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

public class AppUserDetails implements UserDetails {

    private final Long userId;
    private final String username;
    private final String password;
    private final Role role;
    private final Long hubId;
    private final boolean active;

    public AppUserDetails(User user) {
        this.userId = user.getId();
        this.username = user.getUsername();
        this.password = user.getPasswordHash();
        this.role = user.getRole();
        this.hubId = user.getHubId();
        this.active = "ACTIVE".equalsIgnoreCase(user.getStatus().name());
    }

    public AppUserDetails(Customer customer) {
        this.userId = customer.getId();
        this.username = customer.getPhone();
        this.password = customer.getPasswordHash();
        this.role = Role.CUSTOMER;
        this.hubId = null;
        this.active = "ACTIVE".equalsIgnoreCase(customer.getStatus());
    }

    public Long getUserId()  { return userId; }
    public Role getRole()    { return role; }
    public Long getHubId()   { return hubId; }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    @Override public String getPassword()   { return password; }
    @Override public String getUsername()   { return username; }
    @Override public boolean isEnabled()    { return active; }
    @Override public boolean isAccountNonLocked()     { return true; }
    @Override public boolean isAccountNonExpired()     { return true; }
    @Override public boolean isCredentialsNonExpired() { return true; }
}

package com.budgettracker.security;

import com.budgettracker.entity.User;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

/**
 * Spring Security principal wrapping a {@link User} entity.
 */
@Getter
public class UserPrincipal implements UserDetails {

    private final UUID id;
    private final String email;
    private final String passwordHash;
    private final String fullName;
    private final Collection<? extends GrantedAuthority> authorities;
    private final boolean enabled;

    public UserPrincipal(User u) {
        this.id = u.getId();
        this.email = u.getEmail();
        this.passwordHash = u.getPasswordHash();
        this.fullName = u.getFullName();
        this.authorities = List.of(new SimpleGrantedAuthority("ROLE_" + u.getRole().name()));
        this.enabled = u.isEnabled();
    }

    @Override public String getPassword() { return passwordHash; }
    @Override public String getUsername() { return email; }
    @Override public boolean isAccountNonExpired() { return true; }
    @Override public boolean isAccountNonLocked() { return true; }
    @Override public boolean isCredentialsNonExpired() { return true; }
    @Override public boolean isEnabled() { return enabled; }
}

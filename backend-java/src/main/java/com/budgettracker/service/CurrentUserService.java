package com.budgettracker.service;

import com.budgettracker.entity.User;
import com.budgettracker.exception.ResourceNotFoundException;
import com.budgettracker.repository.UserRepository;
import com.budgettracker.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Helper resolving the currently authenticated user from the SecurityContext
 * to a managed {@link User} entity.
 */
@Service
@RequiredArgsConstructor
public class CurrentUserService {

    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public User get() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof UserPrincipal up)) {
            throw new ResourceNotFoundException("Authenticated user not present in security context");
        }
        return userRepository.findById(up.getId())
                .orElseThrow(() -> ResourceNotFoundException.of("User", up.getId()));
    }
}

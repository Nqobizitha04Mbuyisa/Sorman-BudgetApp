package com.budgettracker.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Extracts a bearer JWT from the {@code Authorization} header, validates it,
 * and populates the {@link SecurityContextHolder}.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final String HEADER = "Authorization";
    private static final String PREFIX = "Bearer ";

    private final JwtTokenProvider tokenProvider;
    private final CustomUserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {
        String token = extract(request);
        try {
            if (StringUtils.hasText(token) && tokenProvider.isValid(token)) {
                var claims = tokenProvider.parse(token).getPayload();
                String email = (String) claims.get("email");
                UserDetails details = userDetailsService.loadUserByUsername(email);
                var auth = new UsernamePasswordAuthenticationToken(details, null, details.getAuthorities());
                auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(auth);
            }
        } catch (Exception ex) {
            log.debug("JWT auth error: {}", ex.getMessage());
            SecurityContextHolder.clearContext();
        }
        chain.doFilter(request, response);
    }

    private String extract(HttpServletRequest req) {
        String h = req.getHeader(HEADER);
        if (StringUtils.hasText(h) && h.startsWith(PREFIX)) {
            return h.substring(PREFIX.length());
        }
        return null;
    }
}

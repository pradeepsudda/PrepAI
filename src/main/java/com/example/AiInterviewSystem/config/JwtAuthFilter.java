package com.example.AiInterviewSystem.config;

import com.example.AiInterviewSystem.service.JwtService;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtService         jwtService;
    private final UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest  request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain         filterChain
    ) throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        final String jwt = authHeader.substring(7);

        // ✅ FIX: Catch ExpiredJwtException SEPARATELY and return 401 immediately
        // Previously: one catch(Exception e) → logged warning → continued filter chain
        // → Spring Security returned 403 (not 401) → axios interceptor missed it
        try {
            final String userEmail = jwtService.extractUsername(jwt);

            if (userEmail != null &&
                    SecurityContextHolder.getContext().getAuthentication() == null) {

                UserDetails userDetails = userDetailsService.loadUserByUsername(userEmail);

                if (jwtService.isTokenValid(jwt, userDetails)) {
                    UsernamePasswordAuthenticationToken authToken =
                            new UsernamePasswordAuthenticationToken(
                                    userDetails,
                                    null,
                                    userDetails.getAuthorities()
                            );
                    authToken.setDetails(
                            new WebAuthenticationDetailsSource().buildDetails(request)
                    );
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            }

        } catch (ExpiredJwtException e) {
            // ✅ Token expired → write 401 JSON and STOP the filter chain
            // The 'return' here is critical — without it the request continues
            // and Spring Security returns 403 instead of 401
            log.warn("Expired JWT for [{}]: {}", request.getRequestURI(), e.getMessage());
            write401(response, "Token has expired. Please log in again.");
            return;  // ← stops here, controller never reached

        } catch (JwtException e) {
            // Malformed, unsupported, invalid signature etc.
            log.warn("Invalid JWT for [{}]: {}", request.getRequestURI(), e.getMessage());
            write401(response, "Invalid token. Please log in again.");
            return;

        } catch (Exception e) {
            // Unexpected error (e.g. user not found) — log and let Spring handle it
            log.error("JWT processing error for [{}]: {}", request.getRequestURI(), e.getMessage());
        }

        filterChain.doFilter(request, response);
    }

    private void write401(HttpServletResponse response, String message) throws IOException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);  // 401
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        // Standard header for expired/invalid tokens
        response.setHeader("WWW-Authenticate", "Bearer error=\"invalid_token\"");
        response.getWriter().write(
                "{\"status\":401,\"error\":\"Unauthorized\",\"message\":\"" + message + "\"}"
        );
    }
}

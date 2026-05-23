package com.example.AiInterviewSystem.config;
 
import com.example.AiInterviewSystem.service.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Component;
 
@Component
@RequiredArgsConstructor
@Slf4j
public class WebSocketAuthInterceptor implements ChannelInterceptor {
 
    private final JwtService         jwtService;
    private final UserDetailsService userDetailsService;
 
    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor =
            MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
 
        if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {
            String authHeader = accessor.getFirstNativeHeader("Authorization");
 
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);
                try {
                    String username = jwtService.extractUsername(token);
                    if (username != null) {
                        UserDetails userDetails =
                            userDetailsService.loadUserByUsername(username);
 
                        if (jwtService.isTokenValid(token, userDetails)) {
                            UsernamePasswordAuthenticationToken auth =
                                new UsernamePasswordAuthenticationToken(
                                    userDetails,
                                    null,
                                    userDetails.getAuthorities()
                                );
                            accessor.setUser(auth);
                            log.info("WebSocket authenticated: {}", username);
                        }
                    }
                } catch (Exception e) {
                    log.warn("WebSocket JWT validation failed: {}", e.getMessage());
                }
            } else {
                log.warn("WebSocket CONNECT missing Authorization header");
            }
        }
 
        return message;
    }
}
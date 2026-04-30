package com.example.AiInterviewSystem.service;

import com.example.AiInterviewSystem.dto.AuthResponse;
import com.example.AiInterviewSystem.dto.ChangePasswordRequest;
import com.example.AiInterviewSystem.dto.LoginRequest;
import com.example.AiInterviewSystem.dto.RegisterRequest;
import com.example.AiInterviewSystem.dto.UpdateProfileRequest;
import com.example.AiInterviewSystem.dto.UserDto;
import com.example.AiInterviewSystem.exceptions.ResourceNotFoundException;
import com.example.AiInterviewSystem.model.Role;
import com.example.AiInterviewSystem.model.User;
import com.example.AiInterviewSystem.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
 
@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {
 
    private final UserRepository userRepository;
    private final PasswordEncoder       passwordEncoder;
    private final JwtService            jwtService;
    private final AuthenticationManager authenticationManager;
 
    // ─── Register ────────────────────────────────────────────────────────────
 
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email is already registered");
        }
 
        User user = User.builder()
                .email(request.getEmail().toLowerCase().trim())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName().trim())
                .role(Role.USER)
                .build();
 
        userRepository.save(user);
        log.info("Registered new user: {}", user.getEmail());
 
        String token = jwtService.generateToken(user);
        return new AuthResponse(token, mapToUserDto(user));
    }
 
    // ─── Login ───────────────────────────────────────────────────────────────
 
    public AuthResponse login(LoginRequest request) {
        // Throws BadCredentialsException if wrong credentials — Spring handles it
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail().toLowerCase().trim(),
                        request.getPassword()
                )
        );
 
        User user = userRepository.findByEmail(request.getEmail().toLowerCase().trim())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
 
        String token = jwtService.generateToken(user);
        log.info("User logged in: {}", user.getEmail());
        return new AuthResponse(token, mapToUserDto(user));
    }
 
    // ─── Get current user profile ────────────────────────────────────────────
 
    @Transactional(readOnly = true)
    public UserDto getProfile(User user) {
        return mapToUserDto(user);
    }
 
    // ─── Change password ─────────────────────────────────────────────────────
 
    @Transactional
    public void changePassword(ChangePasswordRequest request, User user) {
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Current password is incorrect");
        }
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        log.info("Password changed for user: {}", user.getEmail());
    }
 
    // ─── Update profile ───────────────────────────────────────────────────────
 
    @Transactional
    public UserDto updateProfile(UpdateProfileRequest request, User user) {
        if (request.getFullName() != null && !request.getFullName().isBlank()) {
            user.setFullName(request.getFullName().trim());
        }
        userRepository.save(user);
        log.info("Profile updated for user: {}", user.getEmail());
        return mapToUserDto(user);
    }
 
    private UserDto mapToUserDto(User user) {
        return new UserDto(user.getId(), user.getEmail(), user.getFullName(), user.getRole().name());
    }
}
 
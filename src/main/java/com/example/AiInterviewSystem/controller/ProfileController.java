package com.example.AiInterviewSystem.controller;

import com.example.AiInterviewSystem.dto.*;
import com.example.AiInterviewSystem.model.User;
import com.example.AiInterviewSystem.service.ProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
 
@RestController
@RequestMapping("/api/v1/profile")
@RequiredArgsConstructor
public class ProfileController {
 
    private final ProfileService profileService;
 
    // GET /api/v1/profile
    @GetMapping
    public ResponseEntity<ProfileDto> getProfile(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(profileService.getProfile(user));
    }
 
    // PUT /api/v1/profile
    @PutMapping
    public ResponseEntity<ProfileDto> updateProfile(
            @Valid @RequestBody UpdateProfileRequest request,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(profileService.updateProfile(request, user));
    }
 
    // PATCH /api/v1/profile/password
    @PatchMapping("/password")
    public ResponseEntity<Void> changePassword(
            @Valid @RequestBody ChangePasswordRequest request,
            @AuthenticationPrincipal User user) {
        profileService.changePassword(request, user);
        return ResponseEntity.noContent().build();
    }
 
    // DELETE /api/v1/profile
    @DeleteMapping
    public ResponseEntity<Void> deleteAccount(
            @RequestParam String confirmPassword,
            @AuthenticationPrincipal User user) {
        profileService.deleteAccount(confirmPassword, user);
        return ResponseEntity.noContent().build();
    }
}
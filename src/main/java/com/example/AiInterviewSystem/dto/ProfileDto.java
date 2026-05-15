package com.example.AiInterviewSystem.dto;

import lombok.Builder;
import lombok.Data;
 
import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;
 
@Data
@Builder
public class ProfileDto {
 
    // ── Identity ─────────────────────────────────────────────────
    private UUID          id;
    private String        email;
    private String        fullName;
    private String        role;
    private String        bio;
    private String        location;
    private LocalDateTime createdAt;    // "Member since"
 
    // ── Platform links ───────────────────────────────────────────
    private String        githubUrl;
    private String        linkedinUrl;
    private String        leetcodeUrl;
    private String        hackerrankUrl;
    private String        codeforcesUrl;
    private String        websiteUrl;
 
    // ── Preferences ──────────────────────────────────────────────
    private String        defaultDifficulty;     // EASY | MEDIUM | HARD
    private String        preferredLanguage;     // python | java | javascript ...
    private boolean       emailNotifications;
 
    // ── Live stats (computed) ────────────────────────────────────
    private ProfileStatsDto stats;
}
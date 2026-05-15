package com.example.AiInterviewSystem.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
 
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.UUID;
 
@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User implements UserDetails {
 
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
 
    @Column(nullable = false, unique = true)
    private String email;
 
    @Column(nullable = false)
    private String password;
 
    @Column(name = "full_name", nullable = false)
    private String fullName;
 
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private Role role = Role.USER;
 
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
 
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(length = 300)
    private String bio;

    @Column(length = 100)
    private String location;

    @Column(name = "github_url")
    private String githubUrl;

    @Column(name = "linkedin_url")
    private String linkedinUrl;

    @Column(name = "leetcode_url")
    private String leetcodeUrl;

    @Column(name = "hackerrank_url")
    private String hackerrankUrl;

    @Column(name = "codeforces_url")
    private String codeforcesUrl;

    @Column(name = "website_url")
    private String websiteUrl;

    @Column(name = "default_difficulty", length = 10)
    @Builder.Default
    private String defaultDifficulty = "MEDIUM";

    @Column(name = "preferred_language", length = 50)
    @Builder.Default
    private String preferredLanguage = "python";

    @Column(name = "email_notifications")
    @Builder.Default
    private boolean emailNotifications = true;
 
    // ── UserDetails interface methods ─────────────────────────────
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }
 
    @Override public String getUsername()               { return email; }
    @Override public boolean isAccountNonExpired()      { return true; }
    @Override public boolean isAccountNonLocked()       { return true; }
    @Override public boolean isCredentialsNonExpired()  { return true; }
    @Override public boolean isEnabled()                { return true; }
}
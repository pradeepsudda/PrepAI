package com.example.AiInterviewSystem.model;

import com.example.AiInterviewSystem.enums.Difficulty;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
 
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
 
@Entity
@Table(name = "coding_challenges")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CodingChallenge {
 
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
 
    // Optional — links challenge to a specific interview session
    @Column(name = "session_id")
    private UUID sessionId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private Difficulty difficulty = Difficulty.MEDIUM;
 
    @Column(nullable = false)
    private String title;
 
    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;
 
    // JSONB column: list of { input, output } example maps
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    @Builder.Default
    private List<Map<String, String>> examples = List.of();
 
    // Array of constraint strings e.g. "1 <= n <= 10^5"
    @Column(columnDefinition = "TEXT[]")
    private String[] constraints;
 
    // JSONB column: map of language → starter code string
    // e.g. { "python": "def solution(nums):\n    pass", "java": "..." }
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "starter_code", columnDefinition = "jsonb")
    @Builder.Default
    private Map<String, String> starterCode = Map.of();
 
    // JSONB column: hidden test cases [{ "input": "...", "expectedOutput": "..." }]
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "test_cases", columnDefinition = "jsonb")
    @Builder.Default
    private List<Map<String, String>> testCases = List.of();
 
    // Default: 30 minutes
    @Column(name = "time_limit_sec")
    @Builder.Default
    private int timeLimitSec = 1800;
 
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
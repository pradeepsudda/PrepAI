package com.example.AiInterviewSystem.model;

import com.example.AiInterviewSystem.dto.TestCaseResult;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
 
@Entity
@Table(name = "code_submissions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CodeSubmission {
 
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
 
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "challenge_id")
    private CodingChallenge challenge;
 
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;
 
    @Column(nullable = false, length = 50)
    private String language;
 
    @Column(name = "source_code", nullable = false, columnDefinition = "TEXT")
    private String sourceCode;
 
    // "Accepted", "Wrong Answer", "Runtime Error", "Time Limit Exceeded", etc.
    @Column(length = 50)
    private String status;
 
    @Column(name = "runtime_ms")
    private Integer runtimeMs;
 
    @Column(name = "memory_kb")
    private Integer memoryKb;
 
    // JSONB: serialised list of TestCaseResult
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "test_results", columnDefinition = "jsonb")
    private List<TestCaseResult> testResults;
 
    @CreationTimestamp
    @Column(name = "submitted_at", updatable = false)
    private LocalDateTime submittedAt;
}
// com/interviewprep/interview/entity/InterviewSession.java
package com.example.AiInterviewSystem.model;

import com.example.AiInterviewSystem.enums.Difficulty;
import com.example.AiInterviewSystem.enums.SessionStatus;
import com.example.AiInterviewSystem.enums.SessionType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
 
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;
 
@Entity
@Table(name = "interview_sessions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InterviewSession {
 
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
 
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
 
    @Enumerated(EnumType.STRING)
    @Column(name = "session_type", nullable = false)
    private SessionType sessionType;
 
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Difficulty difficulty;
 
    @Column(length = 100)
    private String topic;
 
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private SessionStatus status = SessionStatus.IN_PROGRESS;
 
    @Column(name = "total_questions")
    private int totalQuestions;
 
    @Column(name = "started_at", nullable = false)
    @CreationTimestamp
    private LocalDateTime startedAt;
 
    @Column(name = "completed_at")
    private LocalDateTime completedAt;
 
    @Column(name = "overall_score", precision = 5, scale = 2)
    private BigDecimal overallScore;
}

 

 

package com.example.AiInterviewSystem.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "interview_answers")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InterviewAnswer {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", nullable = false)
    private InterviewQuestion question;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    private InterviewSession session;

    @Column(name = "answer_text", columnDefinition = "TEXT")
    private String answerText;

    @Column(name = "audio_duration")
    private Integer audioDuration;

    @Column(name = "technical_score", precision = 5, scale = 2)
    private BigDecimal technicalScore;

    @Column(name = "clarity_score", precision = 5, scale = 2)
    private BigDecimal clarityScore;

    @Column(name = "confidence_score", precision = 5, scale = 2)
    private BigDecimal confidenceScore;

    @Column(name = "overall_score", precision = 5, scale = 2)
    private BigDecimal overallScore;

    @Column(name = "feedback_text", columnDefinition = "TEXT")
    private String feedbackText;

    // PostgreSQL TEXT[] arrays stored as String[]
    @Column(name = "strengths", columnDefinition = "TEXT[]")
    private String[] strengths;

    @Column(name = "improvements", columnDefinition = "TEXT[]")
    private String[] improvements;

    @Column(name = "answered_at")
    @CreationTimestamp
    private LocalDateTime answeredAt;
}

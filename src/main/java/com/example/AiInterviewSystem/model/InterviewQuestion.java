package com.example.AiInterviewSystem.model;

import com.example.AiInterviewSystem.enums.QuestionMode;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
 
import java.time.LocalDateTime;
import java.util.UUID;
 
@Entity
@Table(name = "interview_questions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InterviewQuestion {
 
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
 
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    private InterviewSession session;
 
    @Column(name = "question_text", nullable = false, columnDefinition = "TEXT")
    private String questionText;
 
    @Column(name = "question_type", nullable = false)
    private String questionType;
 
    @Column(name = "order_index", nullable = false)
    private int orderIndex;
 
    @Column(name = "time_limit_sec")
    @Builder.Default
    private int timeLimitSec = 300;
 
    @Enumerated(EnumType.STRING)
    @Column(name = "question_mode", nullable = false)
    @Builder.Default
    private QuestionMode questionMode = QuestionMode.VOICE;

    @Column(name = "suggested_language", length = 50)
    private String suggestedLanguage;
 
    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;
}
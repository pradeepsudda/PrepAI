package com.example.AiInterviewSystem.model;

import jakarta.persistence.*;
import lombok.*;
 
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;
 
@Entity
@Table(
    name = "topic_performance",
    uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "topic", "session_type"})
)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TopicPerformance {
 
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
 
    @Column(name = "user_id", nullable = false)
    private UUID userId;
 
    @Column(nullable = false, length = 100)
    private String topic;
 
    @Column(name = "session_type", nullable = false, length = 50)
    private String sessionType;
 
    @Column(nullable = false)
    @Builder.Default
    private int attempts = 0;
 
    @Column(name = "avg_score", precision = 5, scale = 2)
    private BigDecimal avgScore;
 
    @Column(name = "last_attempted")
    private LocalDateTime lastAttempted;
}
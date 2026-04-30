package com.example.AiInterviewSystem.dto;

import com.example.AiInterviewSystem.enums.Difficulty;
import com.example.AiInterviewSystem.enums.SessionStatus;
import com.example.AiInterviewSystem.enums.SessionType;
import lombok.Builder;
import lombok.Data;
 
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;
 
@Data
@Builder
public class InterviewSessionDto {
    private UUID id;
    private SessionType sessionType;
    private Difficulty difficulty;
    private String topic;
    private SessionStatus status;
    private int totalQuestions;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
    private BigDecimal overallScore;
}
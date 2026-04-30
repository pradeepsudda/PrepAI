package com.example.AiInterviewSystem.dto;

import lombok.Builder;
import lombok.Data;
 
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
 
@Data
@Builder
public class SessionSummaryDto {
    private UUID sessionId;
    private BigDecimal overallScore;
    private BigDecimal avgTechnicalScore;
    private BigDecimal avgClarityScore;
    private BigDecimal avgConfidenceScore;
    private int totalQuestionsAnswered;
    private long durationMinutes;
    private List<String> topStrengths;
    private List<String> topImprovements;
    private LocalDateTime completedAt;
}
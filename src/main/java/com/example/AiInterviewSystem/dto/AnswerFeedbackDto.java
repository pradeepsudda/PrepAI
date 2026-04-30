package com.example.AiInterviewSystem.dto;

import lombok.Builder;
import lombok.Data;
 
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
 
@Data
@Builder
public class AnswerFeedbackDto {
    private UUID answerId;
    private BigDecimal technicalScore;
    private BigDecimal clarityScore;
    private BigDecimal confidenceScore;
    private BigDecimal overallScore;
    private String feedbackText;
    private List<String> strengths;
    private List<String> improvements;
    private String modelAnswer;         // what an ideal answer would look like
}
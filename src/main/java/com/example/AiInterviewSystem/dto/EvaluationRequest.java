package com.example.AiInterviewSystem.dto;

import com.example.AiInterviewSystem.enums.Difficulty;
import lombok.Builder;
import lombok.Data;
 
@Data
@Builder
public class EvaluationRequest {
    private String     questionText;
    private String     questionType;
    private Difficulty difficulty;
    private String     answerText;
    private String     questionMode;  // ✅ NEW — "VOICE" or "CODE" — changes evaluation criteria
}
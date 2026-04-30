package com.example.AiInterviewSystem.dto;

import lombok.Builder;
import lombok.Data;
 
import java.util.UUID;
 
@Data
@Builder
public class QuestionDto {
    private UUID id;
    private String questionText;
    private String questionType;
    private int orderIndex;
    private int timeLimitSec;
    private int currentNumber;
    private int totalQuestions;
}
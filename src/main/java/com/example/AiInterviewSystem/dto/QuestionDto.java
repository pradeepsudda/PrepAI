package com.example.AiInterviewSystem.dto;

import com.example.AiInterviewSystem.enums.QuestionMode;
import lombok.Builder;
import lombok.Data;
 
import java.util.UUID;
 
@Data
@Builder
public class QuestionDto {
    private UUID         id;
    private String       questionText;
    private String       questionType;
    private int          orderIndex;
    private int          timeLimitSec;
    private int          currentNumber;
    private int          totalQuestions;
 
    // ✅ NEW — frontend uses these to decide which UI to show
    private QuestionMode questionMode;       // VOICE or CODE
    private String       suggestedLanguage;  // "python", "java", etc. — null for VOICE
}
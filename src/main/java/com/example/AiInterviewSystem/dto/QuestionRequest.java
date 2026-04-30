package com.example.AiInterviewSystem.dto;

import com.example.AiInterviewSystem.enums.Difficulty;
import com.example.AiInterviewSystem.enums.SessionType;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class QuestionRequest {
    private SessionType sessionType;
    private Difficulty difficulty;
    private String topic;
    private int questionsAsked;
    private String previousAnswer;      // used to vary question style
}
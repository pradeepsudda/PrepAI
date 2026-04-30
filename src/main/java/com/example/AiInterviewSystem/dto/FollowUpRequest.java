package com.example.AiInterviewSystem.dto;

import com.example.AiInterviewSystem.enums.Difficulty;
import com.example.AiInterviewSystem.enums.SessionType;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class FollowUpRequest {
    private String originalQuestion;
    private String candidateAnswer;
    private SessionType sessionType;
    private Difficulty difficulty;
}
package com.example.AiInterviewSystem.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
 
import java.util.UUID;
 
@Data
public class SubmitAnswerRequest {
 
    @NotNull(message = "Question ID is required")
    private UUID questionId;
 
    @NotBlank(message = "Answer text cannot be empty")
    private String answerText;
 
    // Duration in seconds — null when answer was typed, populated when spoken
    private Integer audioDuration;
}
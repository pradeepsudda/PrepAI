package com.example.AiInterviewSystem.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
 
import java.util.UUID;
 
@Data
public class CodeExecutionRequest {
 
    @NotNull(message = "Challenge ID is required")
    private UUID challengeId;
 
    @NotBlank(message = "Language is required")
    private String language;        // "javascript", "python", "java", "cpp", "go"
 
    @NotBlank(message = "Source code is required")
    private String sourceCode;
 
    private String input;           // custom stdin for /run — null for /submit
}
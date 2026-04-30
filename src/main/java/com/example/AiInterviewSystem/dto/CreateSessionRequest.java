package com.example.AiInterviewSystem.dto;


import com.example.AiInterviewSystem.enums.Difficulty;
import com.example.AiInterviewSystem.enums.SessionType;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
 
import java.util.List;
 
@Data
public class CreateSessionRequest {
 
    @NotNull(message = "Session type is required")
    private SessionType sessionType;
 
    @NotNull(message = "Difficulty is required")
    private Difficulty difficulty;
 
    // Single topic focus e.g. "Trees & Graphs", "Microservices"
    private String topic;
 
    // Multi-topic for MIXED sessions e.g. ["Backend", "Distributed Systems"]
    private List<String> topics;
 
    // Optional resume-derived context injected by ResumeService
    // Passed into AI prompts to personalise questions
    private String context;
}
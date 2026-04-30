package com.example.AiInterviewSystem.dto;

import com.example.AiInterviewSystem.enums.Difficulty;
import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Data
@Builder
public class CodingChallengeDto {
    private UUID id;
    private String title;
    private String description;
    private Difficulty difficulty;
    private String[] constraints;
    private List<Map<String, String>> examples;
    private Map<String, String> starterCode;
    private int timeLimitSec;
}

package com.example.AiInterviewSystem.dto;

import com.example.AiInterviewSystem.enums.QuestionMode;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
 
@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class GeneratedQuestion {
 
    @JsonProperty("questionText")
    private String questionText;
 
    // "VOICE" or "CODE"
    @JsonProperty("questionMode")
    private String questionMode;
 
    // "python", "java", "javascript", "cpp" — null for VOICE questions
    @JsonProperty("suggestedLanguage")
    private String suggestedLanguage;
 
    // Convenience method — safe parse with VOICE fallback
    public QuestionMode parsedMode() {
        try {
            return QuestionMode.valueOf(questionMode.toUpperCase());
        } catch (Exception e) {
            return QuestionMode.VOICE;
        }
    }
}
package com.example.AiInterviewSystem.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.util.List;
 
@Data
public class AnswerEvaluation {
 
    @JsonProperty("technicalScore")
    private double technicalScore;
 
    @JsonProperty("clarityScore")
    private double clarityScore;
 
    @JsonProperty("confidenceScore")
    private double confidenceScore;
 
    @JsonProperty("overallScore")
    private double overallScore;
 
    @JsonProperty("feedbackText")
    private String feedbackText;
 
    @JsonProperty("strengths")
    private List<String> strengths;
 
    @JsonProperty("improvements")
    private List<String> improvements;
 
    @JsonProperty("modelAnswer")
    private String modelAnswer;
}
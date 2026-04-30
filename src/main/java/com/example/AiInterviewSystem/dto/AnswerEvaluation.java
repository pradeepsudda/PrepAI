package com.example.AiInterviewSystem.dto;

import lombok.*;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnswerEvaluation {

    private int technicalScore;
    private int clarityScore;
    private int confidenceScore;
    private int overallScore;

    private String feedbackText;

    private List<String> strengths;
    private List<String> improvements;

    private String modelAnswer;
}
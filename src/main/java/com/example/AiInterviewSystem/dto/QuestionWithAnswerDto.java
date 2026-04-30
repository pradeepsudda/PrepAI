package com.example.AiInterviewSystem.dto;

import lombok.Builder;
import lombok.Data;
 
@Data
@Builder
public class QuestionWithAnswerDto {
    private QuestionDto question;
    private AnswerFeedbackDto answer;    // null if the question was never answered
}
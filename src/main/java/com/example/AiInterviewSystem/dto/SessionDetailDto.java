package com.example.AiInterviewSystem.dto;

import lombok.Builder;
import lombok.Data;
 
import java.util.List;
 
@Data
@Builder
public class SessionDetailDto {
    private InterviewSessionDto session;
    private List<QuestionWithAnswerDto> questionsAndAnswers;
}
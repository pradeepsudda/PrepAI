package com.example.AiInterviewSystem.controller;


import com.example.AiInterviewSystem.dto.AnswerFeedbackDto;
import com.example.AiInterviewSystem.dto.CreateSessionRequest;
import com.example.AiInterviewSystem.dto.InterviewSessionDto;
import com.example.AiInterviewSystem.dto.QuestionDto;
import com.example.AiInterviewSystem.dto.SessionDetailDto;
import com.example.AiInterviewSystem.dto.SessionSummaryDto;
import com.example.AiInterviewSystem.dto.SubmitAnswerRequest;
import com.example.AiInterviewSystem.model.User;
import com.example.AiInterviewSystem.service.InterviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/interviews")
@RequiredArgsConstructor
public class InterviewController {

    private final InterviewService interviewService;

    @PostMapping("/sessions")
    public ResponseEntity<InterviewSessionDto> createSession(
            @Valid @RequestBody CreateSessionRequest request,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(interviewService.createSession(request, user));
    }

    @GetMapping("/sessions")
    public ResponseEntity<List<InterviewSessionDto>> getSessions(
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(interviewService.getUserSessions(user));
    }

    @GetMapping("/sessions/{sessionId}")
    public ResponseEntity<SessionDetailDto> getSessionDetail(
            @PathVariable UUID sessionId,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(interviewService.getSessionDetail(sessionId, user));
    }

    @GetMapping("/sessions/{sessionId}/next-question")
    public ResponseEntity<QuestionDto> getNextQuestion(
            @PathVariable UUID sessionId,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(interviewService.generateNextQuestion(sessionId, user));
    }

    @PostMapping("/sessions/{sessionId}/answers")
    public ResponseEntity<AnswerFeedbackDto> submitAnswer(
            @PathVariable UUID sessionId,
            @Valid @RequestBody SubmitAnswerRequest request,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(interviewService.submitAndEvaluate(sessionId, request, user));
    }

    @PostMapping("/sessions/{sessionId}/complete")
    public ResponseEntity<SessionSummaryDto> completeSession(
            @PathVariable UUID sessionId,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(interviewService.completeSession(sessionId, user));
    }

    @PatchMapping("/sessions/{sessionId}/abandon")
    public ResponseEntity<Void> abandonSession(
            @PathVariable UUID sessionId,
            @AuthenticationPrincipal User user) {
        interviewService.abandonSession(sessionId, user);
        return ResponseEntity.noContent().build();
    }
}
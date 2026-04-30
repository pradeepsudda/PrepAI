package com.example.AiInterviewSystem.controller;

import com.example.AiInterviewSystem.dto.CodeExecutionRequest;
import com.example.AiInterviewSystem.dto.CodeExecutionResult;
import com.example.AiInterviewSystem.dto.CodingChallengeDto;
import com.example.AiInterviewSystem.model.User;
import com.example.AiInterviewSystem.service.CodeExecutionService;
import com.example.AiInterviewSystem.service.CodingChallengeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/coding")
@RequiredArgsConstructor
public class CodingController {

    private final CodeExecutionService codeExecutionService;
    private final CodingChallengeService codingChallengeService;

    /** List all challenges with pagination and optional difficulty filter */
    @GetMapping("/challenges")
    public ResponseEntity<Page<CodingChallengeDto>> getChallenges(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String difficulty) {
        return ResponseEntity.ok(codingChallengeService.getChallenges(page, size, difficulty));
    }

    /** Get a single challenge by ID (includes starter code, no hidden test cases) */
    @GetMapping("/challenges/{id}")
    public ResponseEntity<CodingChallengeDto> getChallenge(@PathVariable UUID id) {
        return ResponseEntity.ok(codingChallengeService.getChallengeById(id));
    }

    /** Quick run: user-supplied test input, no persistence */
    @PostMapping("/run")
    public ResponseEntity<CodeExecutionResult> runCode(
            @Valid @RequestBody CodeExecutionRequest request,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(codeExecutionService.runCode(request));
    }

    /** Full submit: runs all hidden test cases, saves result */
    @PostMapping("/submit")
    public ResponseEntity<CodeExecutionResult> submitCode(
            @Valid @RequestBody CodeExecutionRequest request,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(codeExecutionService.submitCode(request, user));
    }
}
package com.example.AiInterviewSystem.controller;

import com.example.AiInterviewSystem.dto.CreateSessionRequest;
import com.example.AiInterviewSystem.dto.ResumeProfile;
import com.example.AiInterviewSystem.enums.SessionType;
import com.example.AiInterviewSystem.model.User;
import com.example.AiInterviewSystem.service.ResumeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
 
import java.io.IOException;
 
@RestController
@RequestMapping("/api/v1/resume")
@RequiredArgsConstructor
public class ResumeController {
 
    private final ResumeService resumeService;
 
    // Upload and parse resume
    @PostMapping(value = "/parse", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ResumeProfile> parseResume(
            @RequestPart("file") MultipartFile file,
            @AuthenticationPrincipal User user) throws IOException {
        return ResponseEntity.ok(resumeService.parseResume(file));
    }
 
    // Build a personalized session config from parsed profile
    @PostMapping("/personalise")
    public ResponseEntity<CreateSessionRequest> personaliseSession(
            @RequestBody ResumeProfile profile,
            @RequestParam(defaultValue = "MIXED") SessionType sessionType,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(resumeService.buildPersonalisedSession(profile, sessionType));
    }
}
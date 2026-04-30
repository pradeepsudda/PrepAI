package com.example.AiInterviewSystem.controller;

import com.example.AiInterviewSystem.dto.UserAnalyticsDashboard;
import com.example.AiInterviewSystem.model.User;
import com.example.AiInterviewSystem.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/dashboard")
    public ResponseEntity<UserAnalyticsDashboard> getDashboard(
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(analyticsService.getDashboard(user));
    }
}
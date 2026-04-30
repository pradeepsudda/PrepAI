package com.example.AiInterviewSystem.dto;

import lombok.*;

import java.util.List;
import java.util.Map;

@Data
@Builder
public class UserAnalyticsDashboard {
 
    private int    totalSessionsAllTime;
    private int    totalSessionsLast30Days;
    private double avgScore;
    private double completionRatePercent;
 
    // Daily score trend for the last 30 days
    private List<ScorePoint> scoreTrend;
 
    // e.g. { "DSA": 72.5, "BEHAVIORAL": 85.0, "SYSTEM_DESIGN": 60.0 }
    private Map<String, Double> categoryScores;
 
    // Topics where avg score >= 75
    private List<String> strongTopics;
 
    // Topics where avg score < 60
    private List<String> weakTopics;
}
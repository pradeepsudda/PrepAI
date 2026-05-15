package com.example.AiInterviewSystem.dto;

import lombok.Builder;
import lombok.Data;
 
@Data
@Builder
public class ProfileStatsDto {
    private int    totalSessions;
    private int    completedSessions;
    private int    abandonedSessions;
    private double avgScore;
    private double bestScore;
    private int    totalQuestionsAnswered;
    private long   totalPracticeMinutes;
    private int    currentStreak;         // consecutive days with a session
    private int    longestStreak;
    private String strongestCategory;    // DSA | SYSTEM_DESIGN | BEHAVIORAL | MIXED
    private String weakestCategory;
    private int    dsaSessions;
    private int    systemDesignSessions;
    private int    behavioralSessions;
    private int    mixedSessions;
}
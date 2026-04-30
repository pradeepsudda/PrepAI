package com.example.AiInterviewSystem.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
 
@Data
@AllArgsConstructor
@NoArgsConstructor
public class ScorePoint {
    private String date;    // ISO date string e.g. "2025-04-15"
    private double score;   // 0–100
}
package com.example.AiInterviewSystem.dto;

import lombok.Data;
import java.util.List;
 
@Data
public class ResourceRequest {
 
    // Categories to cover: DSA, SYSTEM_DESIGN, BEHAVIORAL, MIXED
    private List<String> categories;
 
    // Optionally override analytics (backend auto-fills from DB if null)
    private String weakestCategory;
    private String strongestCategory;
 
    // Optional free-text topic e.g. "binary trees", "kafka"
    private String specificTopic;
 
    // QUICK (1-2 weeks) | THOROUGH (1 month) | COMPREHENSIVE (3 months)
    private String prepDepth;
 
    // ── Set by backend from DB — not from client ──────────────
    private double avgScore;
    private int    totalSessions;
}
 
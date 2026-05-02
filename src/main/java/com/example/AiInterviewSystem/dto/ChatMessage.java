package com.example.AiInterviewSystem.dto;

import lombok.Data;

import java.time.Instant;

@Data
public class ChatMessage {
    private String text;
    private String sender;     // set server-side from principal.getName() (email)
    private Instant timestamp;  // epoch millis — safe for new Date(ms) in JS
}
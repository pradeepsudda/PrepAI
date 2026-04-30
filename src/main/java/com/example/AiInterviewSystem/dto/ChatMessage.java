package com.example.AiInterviewSystem.dto;

import lombok.Data;
 
import java.time.LocalDateTime;
 
@Data
public class ChatMessage {
    private String        text;
    private String        sender;       // set server-side from Principal
    private LocalDateTime timestamp;    // set server-side
}
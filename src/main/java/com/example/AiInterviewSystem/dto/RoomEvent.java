package com.example.AiInterviewSystem.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RoomEvent {
    private String type;       // USER_JOINED | USER_LEFT
    private String userId;     // email of the user
    private Instant timestamp;
    // epoch millis — safe for new Date(ms) in JS
    private List<String> participants;
}
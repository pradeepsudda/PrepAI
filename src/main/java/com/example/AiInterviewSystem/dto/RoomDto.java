package com.example.AiInterviewSystem.dto;

import lombok.Builder;
import lombok.Data;
 
import java.time.LocalDateTime;
import java.util.UUID;
 
@Data
@Builder
public class RoomDto {
    private UUID          id;
    private String        roomCode;
    private UUID          hostId;
    private int           participantCount;
    private boolean       active;
    private LocalDateTime createdAt;
}
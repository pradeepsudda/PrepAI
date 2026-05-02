package com.example.AiInterviewSystem.controller;

import com.example.AiInterviewSystem.dto.ChatMessage;
import com.example.AiInterviewSystem.dto.CodeChangeEvent;
import com.example.AiInterviewSystem.dto.RoomEvent;
import com.example.AiInterviewSystem.dto.WebRtcSignal;
import com.example.AiInterviewSystem.service.RoomService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.security.Principal;
import java.time.Instant;
import java.util.List;

@Controller
@RequiredArgsConstructor
@Slf4j
public class WebSocketMessageController {

    private final SimpMessagingTemplate messagingTemplate;
    private final RoomService           roomService;

    // ─── Join ────────────────────────────────────────────────────
    @MessageMapping("/room/{roomId}/join")
    public void joinRoom(@DestinationVariable String roomId, Principal principal) {
        if (principal == null) { log.warn("joinRoom: null principal room={}", roomId); return; }

        String username = principal.getName();

        // Add to DB participant list and get the FULL updated list back
        List<String> allParticipants = roomService.addParticipantAndGetAll(roomId, username);

        // ✅ Broadcast FULL list — every subscriber replaces their local list
        RoomEvent event = RoomEvent.builder()
                .type("USER_JOINED")
                .userId(username)
                .participants(allParticipants)   // full list, not just the new user
                .timestamp(Instant.now())
                .build();

        messagingTemplate.convertAndSend("/topic/room/" + roomId + "/events", event);
        log.info("User {} joined room {} — total participants: {}", username, roomId, allParticipants.size());
    }

    // ─── Leave ───────────────────────────────────────────────────
    @MessageMapping("/room/{roomId}/leave")
    public void leaveRoom(@DestinationVariable String roomId, Principal principal) {
        if (principal == null) return;

        String username = principal.getName();

        // Remove from DB and get remaining list
        List<String> remaining = roomService.removeParticipantAndGetAll(roomId, username);

        RoomEvent event = RoomEvent.builder()
                .type("USER_LEFT")
                .userId(username)
                .participants(remaining)   // updated list after removal
                .timestamp(Instant.now())
                .build();

        messagingTemplate.convertAndSend("/topic/room/" + roomId + "/events", event);
        log.info("User {} left room {} — remaining: {}", username, roomId, remaining.size());
    }

    // ─── Chat message ────────────────────────────────────────────
    @MessageMapping("/room/{roomId}/message")
    public void sendMessage(@DestinationVariable String roomId,
                            @Payload ChatMessage message,
                            Principal principal) {
        if (principal == null) { log.warn("sendMessage: null principal"); return; }

        message.setSender(principal.getName());
        message.setTimestamp(Instant.now());
        messagingTemplate.convertAndSend("/topic/room/" + roomId + "/messages", message);
    }

    // ─── Code + language sync ────────────────────────────────────
    @MessageMapping("/room/{roomId}/code")
    public void syncCode(@DestinationVariable String roomId,
                         @Payload CodeChangeEvent event,
                         Principal principal) {
        if (principal == null) return;
        event.setUpdatedBy(principal.getName());
        // Broadcast to ALL — frontend ignores events from itself using updatedBy field
        messagingTemplate.convertAndSend("/topic/room/" + roomId + "/code", event);
    }

    // ─── WebRTC signaling (NEW — for audio) ──────────────────────
    // Backend is just a relay — it doesn't process WebRTC signals,
    // just forwards them to the target peer
    @MessageMapping("/room/{roomId}/webrtc")
    public void relayWebRtcSignal(@DestinationVariable String roomId,
                                  @Payload WebRtcSignal signal,
                                  Principal principal) {
        if (principal == null) return;
        signal.setFrom(principal.getName());

        // Send directly to the target user's personal queue
        // /user/{targetUser}/queue/webrtc
        messagingTemplate.convertAndSendToUser(
                signal.getTo(),
                "/queue/webrtc",
                signal
        );
        log.debug("WebRTC signal {} from {} to {} in room {}",
                signal.getType(), signal.getFrom(), signal.getTo(), roomId);
    }
}
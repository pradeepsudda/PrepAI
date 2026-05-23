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

    @MessageMapping("/room/{roomId}/join")
    public void joinRoom(@DestinationVariable String roomId, Principal principal) {
        if (principal == null) { log.warn("joinRoom: null principal room={}", roomId); return; }

        String username = principal.getName();
        List<String> allParticipants = roomService.addParticipantAndGetAll(roomId, username);

        RoomEvent event = RoomEvent.builder()
                .type("USER_JOINED")
                .userId(username)
                .participants(allParticipants)
                .timestamp(Instant.now())
                .build();

        messagingTemplate.convertAndSend("/topic/room/" + roomId + "/events", event);
        log.info("User {} joined room {} — total participants: {}", username, roomId, allParticipants.size());
    }

    @MessageMapping("/room/{roomId}/leave")
    public void leaveRoom(@DestinationVariable String roomId, Principal principal) {
        if (principal == null) return;

        String username = principal.getName();

        List<String> remaining = roomService.removeParticipantAndGetAll(roomId, username);

        RoomEvent event = RoomEvent.builder()
                .type("USER_LEFT")
                .userId(username)
                .participants(remaining)
                .timestamp(Instant.now())
                .build();

        messagingTemplate.convertAndSend("/topic/room/" + roomId + "/events", event);
        log.info("User {} left room {} — remaining: {}", username, roomId, remaining.size());
    }

    @MessageMapping("/room/{roomId}/message")
    public void sendMessage(@DestinationVariable String roomId,
                            @Payload ChatMessage message,
                            Principal principal) {
        if (principal == null) { log.warn("sendMessage: null principal"); return; }

        message.setSender(principal.getName());
        message.setTimestamp(Instant.now());
        messagingTemplate.convertAndSend("/topic/room/" + roomId + "/messages", message);
    }

    @MessageMapping("/room/{roomId}/code")
    public void syncCode(@DestinationVariable String roomId,
                         @Payload CodeChangeEvent event,
                         Principal principal) {
        if (principal == null) return;
        event.setUpdatedBy(principal.getName());
        messagingTemplate.convertAndSend("/topic/room/" + roomId + "/code", event);
    }

    @MessageMapping("/room/{roomId}/webrtc")
    public void relayWebRtcSignal(@DestinationVariable String roomId,
                                  @Payload WebRtcSignal signal,
                                  Principal principal) {
        if (principal == null) return;
        signal.setFrom(principal.getName());

        messagingTemplate.convertAndSendToUser(
                signal.getTo(),
                "/queue/webrtc",
                signal
        );
        log.debug("WebRTC signal {} from {} to {} in room {}",
                signal.getType(), signal.getFrom(), signal.getTo(), roomId);
    }
}
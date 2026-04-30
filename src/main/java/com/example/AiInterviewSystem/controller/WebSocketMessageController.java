package com.example.AiInterviewSystem.controller;

import com.example.AiInterviewSystem.dto.ChatMessage;
import com.example.AiInterviewSystem.dto.CodeChangeEvent;
import com.example.AiInterviewSystem.dto.RoomEvent;
import com.example.AiInterviewSystem.service.RoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
 
import java.security.Principal;
import java.time.LocalDateTime;
 
@Controller
@RequiredArgsConstructor
public class WebSocketMessageController {
 
    private final SimpMessagingTemplate messagingTemplate;
    private final RoomService roomService;
 
    @MessageMapping("/room/{roomId}/join")
    public void joinRoom(@DestinationVariable String roomId, Principal principal) {
        roomService.addParticipant(roomId, principal.getName());
        messagingTemplate.convertAndSend(
                "/topic/room/" + roomId + "/events",
                new RoomEvent("USER_JOINED", principal.getName(), LocalDateTime.now())
        );
    }
 
    @MessageMapping("/room/{roomId}/leave")
    public void leaveRoom(@DestinationVariable String roomId, Principal principal) {
        roomService.removeParticipant(roomId, principal.getName());
        messagingTemplate.convertAndSend(
                "/topic/room/" + roomId + "/events",
                new RoomEvent("USER_LEFT", principal.getName(), LocalDateTime.now())
        );
    }
 
    @MessageMapping("/room/{roomId}/message")
    public void sendMessage(@DestinationVariable String roomId,
                            @Payload ChatMessage message,
                            Principal principal) {
        message.setSender(principal.getName());
        message.setTimestamp(LocalDateTime.now());
        messagingTemplate.convertAndSend("/topic/room/" + roomId + "/messages", message);
    }
 
    @MessageMapping("/room/{roomId}/code")
    public void syncCode(@DestinationVariable String roomId,
                         @Payload CodeChangeEvent event,
                         Principal principal) {
        event.setUpdatedBy(principal.getName());
        // Broadcast to all subscribers except sender
        messagingTemplate.convertAndSend("/topic/room/" + roomId + "/code", event);
    }
}
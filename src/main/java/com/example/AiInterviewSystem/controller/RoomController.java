package com.example.AiInterviewSystem.controller;

import com.example.AiInterviewSystem.dto.RoomDto;
import com.example.AiInterviewSystem.model.User;
import com.example.AiInterviewSystem.service.RoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/api/v1/rooms")
@RequiredArgsConstructor
public class RoomController {
 
    private final RoomService roomService;
 
    @PostMapping
    public ResponseEntity<RoomDto> createRoom(@AuthenticationPrincipal User user) {
        return ResponseEntity.status(HttpStatus.CREATED).body(roomService.createRoom(user));
    }
 
    @GetMapping("/{roomCode}/join")
    public ResponseEntity<RoomDto> joinRoom(
            @PathVariable String roomCode,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(roomService.joinRoom(roomCode, user));
    }
 
    @DeleteMapping("/{roomCode}")
    public ResponseEntity<Void> closeRoom(
            @PathVariable String roomCode,
            @AuthenticationPrincipal User user) {
        roomService.closeRoom(roomCode, user);
        return ResponseEntity.noContent().build();
    }
 
    @GetMapping
    public ResponseEntity<List<RoomDto>> getActiveRooms() {
        return ResponseEntity.ok(roomService.getActiveRooms());
    }
}
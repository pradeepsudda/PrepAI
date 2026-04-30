package com.example.AiInterviewSystem.service;

import com.example.AiInterviewSystem.dto.RoomDto;
import com.example.AiInterviewSystem.exceptions.ResourceNotFoundException;
import com.example.AiInterviewSystem.exceptions.UnauthorizedException;
import com.example.AiInterviewSystem.model.InterviewRoom;
import com.example.AiInterviewSystem.model.User;
import com.example.AiInterviewSystem.repository.InterviewRoomRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
 
import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;
import java.util.UUID;
 
@Service
@RequiredArgsConstructor
@Slf4j
public class RoomService {
 
    private final InterviewRoomRepository roomRepository;
 
    // ─── Create a new live interview room ───────────────────────────────────
 
    @Transactional
    public RoomDto createRoom(User host) {
        String code = generateRoomCode();
 
        InterviewRoom room = InterviewRoom.builder()
                .hostId(host.getId())
                .roomCode(code)
                .active(true)
                .createdAt(LocalDateTime.now())
                .build();
 
        roomRepository.save(room);
        log.info("Room {} created by user {}", code, host.getId());
 
        return mapToDto(room);
    }
 
    // ─── Join an existing room by code ──────────────────────────────────────
 
    @Transactional(readOnly = true)
    public RoomDto joinRoom(String roomCode, User user) {
        InterviewRoom room = roomRepository.findByRoomCodeAndActiveTrue(roomCode)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Room not found or no longer active: " + roomCode));
 
        log.info("User {} joining room {}", user.getId(), roomCode);
        return mapToDto(room);
    }
 
    // ─── Add/remove participant tracking ────────────────────────────────────
 
    @Transactional
    public void addParticipant(String roomId, String userEmail) {
        InterviewRoom room = roomRepository.findById(UUID.fromString(roomId))
                .orElseThrow(() -> new ResourceNotFoundException("Room not found: " + roomId));
 
        List<String> participants = room.getParticipants();
        if (!participants.contains(userEmail)) {
            participants.add(userEmail);
            room.setParticipants(participants);
            roomRepository.save(room);
        }
    }
 
    @Transactional
    public void removeParticipant(String roomId, String userEmail) {
        roomRepository.findById(UUID.fromString(roomId)).ifPresent(room -> {
            room.getParticipants().remove(userEmail);
            // Close room if host left
            if (room.getParticipants().isEmpty()) {
                room.setActive(false);
            }
            roomRepository.save(room);
            log.info("User {} left room {}", userEmail, roomId);
        });
    }
 
    // ─── Close room ──────────────────────────────────────────────────────────
 
    @Transactional
    public void closeRoom(String roomCode, User host) {
        InterviewRoom room = roomRepository.findByRoomCodeAndActiveTrue(roomCode)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found: " + roomCode));
 
        if (!room.getHostId().equals(host.getId())) {
            throw new UnauthorizedException(
                    "Only the host can close the room");
        }
 
        room.setActive(false);
        roomRepository.save(room);
        log.info("Room {} closed by host {}", roomCode, host.getId());
    }
 
    // ─── Get all active rooms (admin / lobby) ────────────────────────────────
 
    @Transactional(readOnly = true)
    public List<RoomDto> getActiveRooms() {
        return roomRepository.findByActiveTrueOrderByCreatedAtDesc()
                .stream()
                .map(this::mapToDto)
                .toList();
    }
 
    // ─── Helpers ─────────────────────────────────────────────────────────────
 
    private String generateRoomCode() {
        // 6-character uppercase alphanumeric code e.g. "AB12CD"
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        StringBuilder code = new StringBuilder();
        Random rng = new Random();
        for (int i = 0; i < 6; i++) {
            code.append(chars.charAt(rng.nextInt(chars.length())));
        }
        // Ensure unique
        if (roomRepository.existsByRoomCode(code.toString())) {
            return generateRoomCode();
        }
        return code.toString();
    }
 
    private RoomDto mapToDto(InterviewRoom room) {
        return RoomDto.builder()
                .id(room.getId())
                .roomCode(room.getRoomCode())
                .hostId(room.getHostId())
                .participantCount(room.getParticipants().size())
                .active(room.isActive())
                .createdAt(room.getCreatedAt())
                .build();
    }
}
 
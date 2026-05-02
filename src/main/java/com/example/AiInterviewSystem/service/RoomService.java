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
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class RoomService {

    private final InterviewRoomRepository roomRepository;

    @Transactional
    public RoomDto createRoom(User host) {
        String code = generateRoomCode();
        InterviewRoom room = InterviewRoom.builder()
                .hostId(host.getId())
                .roomCode(code)
                .active(true)
                .participants(new ArrayList<>())
                .createdAt(LocalDateTime.now())
                .build();
        roomRepository.save(room);
        log.info("Room {} created by {}", code, host.getId());
        return mapToDto(room);
    }

    @Transactional(readOnly = true)
    public RoomDto joinRoom(String roomCode, User user) {
        InterviewRoom room = roomRepository.findByRoomCodeAndActiveTrue(roomCode)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found: " + roomCode));
        log.info("User {} joining room {}", user.getId(), roomCode);
        return mapToDto(room);
    }

    // ✅ NEW — add participant and return FULL updated list
    @Transactional
    public List<String> addParticipantAndGetAll(String roomId, String userEmail) {
        InterviewRoom room = roomRepository.findById(UUID.fromString(roomId))
                .orElseThrow(() -> new ResourceNotFoundException("Room not found: " + roomId));

        List<String> participants = room.getParticipants();
        if (participants == null) participants = new ArrayList<>();

        if (!participants.contains(userEmail)) {
            participants.add(userEmail);
            room.setParticipants(participants);
            roomRepository.save(room);
        }
        return new ArrayList<>(participants);  // return copy
    }

    // ✅ NEW — remove participant and return FULL remaining list
    @Transactional
    public List<String> removeParticipantAndGetAll(String roomId, String userEmail) {
        InterviewRoom room = roomRepository.findById(UUID.fromString(roomId))
                .orElseThrow(() -> new ResourceNotFoundException("Room not found: " + roomId));

        List<String> participants = room.getParticipants();
        if (participants == null) participants = new ArrayList<>();

        participants.remove(userEmail);
        room.setParticipants(participants);

        if (participants.isEmpty()) {
            room.setActive(false);
        }
        roomRepository.save(room);
        log.info("User {} left room {}", userEmail, roomId);
        return new ArrayList<>(participants);
    }

    // Keep old methods for backward compat
    @Transactional
    public void addParticipant(String roomId, String userEmail) {
        addParticipantAndGetAll(roomId, userEmail);
    }

    @Transactional
    public void removeParticipant(String roomId, String userEmail) {
        removeParticipantAndGetAll(roomId, userEmail);
    }

    @Transactional
    public void closeRoom(String roomCode, User host) {
        InterviewRoom room = roomRepository.findByRoomCodeAndActiveTrue(roomCode)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found: " + roomCode));
        if (!room.getHostId().equals(host.getId())) {
            throw new UnauthorizedException("Only the host can close the room");
        }
        room.setActive(false);
        roomRepository.save(room);
    }

    @Transactional(readOnly = true)
    public List<RoomDto> getActiveRooms() {
        return roomRepository.findByActiveTrueOrderByCreatedAtDesc()
                .stream().map(this::mapToDto).toList();
    }

    private String generateRoomCode() {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        StringBuilder code = new StringBuilder();
        Random rng = new Random();
        for (int i = 0; i < 6; i++) code.append(chars.charAt(rng.nextInt(chars.length())));
        if (roomRepository.existsByRoomCode(code.toString())) return generateRoomCode();
        return code.toString();
    }

    private RoomDto mapToDto(InterviewRoom room) {
        return RoomDto.builder()
                .id(room.getId())
                .roomCode(room.getRoomCode())
                .hostId(room.getHostId())
                .participantCount(room.getParticipants() == null ? 0 : room.getParticipants().size())
                .active(room.isActive())
                .createdAt(room.getCreatedAt())
                .build();
    }
}
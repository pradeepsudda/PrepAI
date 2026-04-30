package com.example.AiInterviewSystem.repository;

import com.example.AiInterviewSystem.model.InterviewRoom;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
 
public interface InterviewRoomRepository extends JpaRepository<InterviewRoom, UUID> {
 
    Optional<InterviewRoom> findByRoomCodeAndActiveTrue(String roomCode);
 
    List<InterviewRoom> findByActiveTrueOrderByCreatedAtDesc();
 
    boolean existsByRoomCode(String roomCode);
 
    List<InterviewRoom> findByHostIdAndActiveTrue(UUID hostId);
}
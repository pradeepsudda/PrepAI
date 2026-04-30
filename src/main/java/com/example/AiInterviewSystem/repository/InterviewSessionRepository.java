package com.example.AiInterviewSystem.repository;

 
import com.example.AiInterviewSystem.model.InterviewSession;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
 
public interface InterviewSessionRepository extends JpaRepository<InterviewSession, UUID> {
 
    List<InterviewSession> findByUserIdOrderByStartedAtDesc(UUID userId);
 
    List<InterviewSession> findByUserIdAndStartedAtAfter(UUID userId, LocalDateTime after);
 
    long countByUserId(UUID userId);
}
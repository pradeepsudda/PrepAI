package com.example.AiInterviewSystem.repository;

import com.example.AiInterviewSystem.model.InterviewAnswer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
 
public interface InterviewAnswerRepository extends JpaRepository<InterviewAnswer, UUID> {
 
    List<InterviewAnswer> findBySessionId(UUID sessionId);
 
    Optional<InterviewAnswer> findByQuestionId(UUID questionId);
 
    Optional<InterviewAnswer> findTopBySessionIdOrderByAnsweredAtDesc(UUID sessionId);
 
    long countBySessionId(UUID sessionId);
}
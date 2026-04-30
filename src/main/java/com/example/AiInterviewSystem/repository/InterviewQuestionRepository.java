package com.example.AiInterviewSystem.repository;

import com.example.AiInterviewSystem.model.InterviewQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
 
public interface InterviewQuestionRepository extends JpaRepository<InterviewQuestion, UUID> {
 
    List<InterviewQuestion> findBySessionIdOrderByOrderIndex(UUID sessionId);
 
    int countBySessionId(UUID sessionId);
 
    Optional<InterviewQuestion> findTopBySessionIdOrderByOrderIndexDesc(UUID sessionId);
 
    @Query("SELECT q FROM InterviewQuestion q WHERE q.session.id = :sessionId ORDER BY q.orderIndex ASC")
    List<InterviewQuestion> findAllBySessionOrdered(UUID sessionId);
}
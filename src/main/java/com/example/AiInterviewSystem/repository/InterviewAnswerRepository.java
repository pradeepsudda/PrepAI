package com.example.AiInterviewSystem.repository;

import com.example.AiInterviewSystem.model.InterviewAnswer;
import io.lettuce.core.dynamic.annotation.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
 
public interface InterviewAnswerRepository extends JpaRepository<InterviewAnswer, UUID> {
 
    List<InterviewAnswer> findBySessionId(UUID sessionId);
 
    Optional<InterviewAnswer> findByQuestionId(UUID questionId);
 
    Optional<InterviewAnswer> findTopBySessionIdOrderByAnsweredAtDesc(UUID sessionId);

    @Query("SELECT a FROM InterviewAnswer a WHERE a.session.id IN :sessionIds")
    List<InterviewAnswer> findBySessionIds(@Param("sessionIds") List<UUID> sessionIds);
}
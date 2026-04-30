package com.example.AiInterviewSystem.repository;

import com.example.AiInterviewSystem.model.CodeSubmission;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;
 
public interface CodeSubmissionRepository extends JpaRepository<CodeSubmission, UUID> {
 
    List<CodeSubmission> findByUserId(UUID userId);
 
    List<CodeSubmission> findByChallengeId(UUID challengeId);
 
    // Most recent submission per challenge for a user
    List<CodeSubmission> findTopByChallengeIdAndUserIdOrderBySubmittedAtDesc(
            UUID challengeId, UUID userId);
 
    long countByUserIdAndStatus(UUID userId, String status);
}
 
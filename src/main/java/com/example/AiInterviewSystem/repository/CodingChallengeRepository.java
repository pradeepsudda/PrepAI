package com.example.AiInterviewSystem.repository;

import com.example.AiInterviewSystem.enums.Difficulty;
import com.example.AiInterviewSystem.model.CodingChallenge;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface CodingChallengeRepository extends JpaRepository<CodingChallenge, UUID> {

    Page<CodingChallenge> findByDifficulty(Difficulty difficulty, Pageable pageable);
}
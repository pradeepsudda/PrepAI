package com.example.AiInterviewSystem.service;

import com.example.AiInterviewSystem.dto.CodingChallengeDto;
import com.example.AiInterviewSystem.enums.Difficulty;
import com.example.AiInterviewSystem.exceptions.ResourceNotFoundException;
import com.example.AiInterviewSystem.model.CodingChallenge;
import com.example.AiInterviewSystem.repository.CodingChallengeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CodingChallengeService {

    private final CodingChallengeRepository repository;

    public Page<CodingChallengeDto> getChallenges(int page, int size, String difficulty) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").ascending());
        Page<CodingChallenge> challenges;
        if (difficulty != null && !difficulty.isBlank()) {
            Difficulty diff = Difficulty.valueOf(difficulty.toUpperCase());
            challenges = repository.findByDifficulty(diff, pageable);
        } else {
            challenges = repository.findAll(pageable);
        }
        return challenges.map(this::toDto);
    }

    public CodingChallengeDto getChallengeById(UUID id) {
        CodingChallenge challenge = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Challenge not found: " + id));
        return toDto(challenge);
    }

    private CodingChallengeDto toDto(CodingChallenge c) {
        return CodingChallengeDto.builder()
                .id(c.getId())
                .title(c.getTitle())
                .description(c.getDescription())
                .difficulty(c.getDifficulty())
                .constraints(c.getConstraints())
                .examples(c.getExamples())
                .starterCode(c.getStarterCode())
                .timeLimitSec(c.getTimeLimitSec())
                .build();
    }
}

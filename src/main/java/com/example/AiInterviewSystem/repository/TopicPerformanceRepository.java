package com.example.AiInterviewSystem.repository;

import com.example.AiInterviewSystem.model.TopicPerformance;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
 
public interface TopicPerformanceRepository extends JpaRepository<TopicPerformance, UUID> {
 
    List<TopicPerformance> findByUserId(UUID userId);
 
    Optional<TopicPerformance> findByUserIdAndTopicAndSessionType(
            UUID userId, String topic, String sessionType);
}
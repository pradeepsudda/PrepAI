package com.example.AiInterviewSystem.service;

import com.example.AiInterviewSystem.dto.ResourceRequest;
import com.example.AiInterviewSystem.dto.ResourcesResponse;
import com.example.AiInterviewSystem.exceptions.AIResponseException;
import com.example.AiInterviewSystem.model.InterviewSession;
import com.example.AiInterviewSystem.model.User;
import com.example.AiInterviewSystem.repository.InterviewSessionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
 
import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
 
@Service
@RequiredArgsConstructor
@Slf4j
public class ResourceService {
 
    private final AIOrchestrationService        aiService;
    private final InterviewSessionRepository    sessionRepository;
    private final RedisTemplate<String, Object> redisTemplate;
 
    private static final String   CACHE_PREFIX = "resources:";
    private static final Duration CACHE_TTL    = Duration.ofHours(6);
 
    public ResourcesResponse generateResources(ResourceRequest request, User user) {
        ResourceRequest enriched = enrichWithAnalytics(request, user);
 
        // Try cache first — each unique (user + categories + depth + topic) is cached
        String cacheKey = buildCacheKey(user.getId().toString(), enriched);
        try {
            Object cached = redisTemplate.opsForValue().get(cacheKey);
            if (cached instanceof ResourcesResponse cachedResp) {
                log.info("Resources cache HIT for user {}", user.getId());
                return cachedResp;
            }
        } catch (Exception e) {
            log.warn("Redis cache read failed, proceeding without cache: {}", e.getMessage());
        }
 
        log.info("Generating AI resources for user {} weakest={} score={}",
                user.getId(), enriched.getWeakestCategory(), enriched.getAvgScore());
 
        ResourcesResponse response = aiService.generateResources(enriched).block();
        if (response == null) {
            throw new AIResponseException("AI returned null resources response");
        }
 
        // Cache result
        try {
            redisTemplate.opsForValue().set(cacheKey, response, CACHE_TTL);
        } catch (Exception e) {
            log.warn("Redis cache write failed: {}", e.getMessage());
        }
 
        return response;
    }
 
    public void invalidateCache(User user) {
        try {
            var keys = redisTemplate.keys(CACHE_PREFIX + user.getId() + ":*");
            if (keys != null && !keys.isEmpty()) {
                redisTemplate.delete(keys);
                log.info("Cleared {} resource cache entries for user {}", keys.size(), user.getId());
            }
        } catch (Exception e) {
            log.warn("Cache invalidation failed: {}", e.getMessage());
        }
    }
 
    private ResourceRequest enrichWithAnalytics(ResourceRequest req, User user) {
        List<InterviewSession> sessions =
                sessionRepository.findByUserIdOrderByStartedAtDesc(user.getId());
 
        if (sessions.isEmpty()) {
            req.setAvgScore(0);
            req.setTotalSessions(0);
            if (req.getWeakestCategory()  == null) req.setWeakestCategory("DSA");
            if (req.getStrongestCategory() == null) req.setStrongestCategory("Unknown");
            if (req.getCategories() == null || req.getCategories().isEmpty()) {
                req.setCategories(List.of("DSA", "SYSTEM_DESIGN", "BEHAVIORAL", "MIXED"));
            }
            return req;
        }
 
        double avg = sessions.stream()
                .filter(s -> s.getOverallScore() != null)
                .mapToDouble(s -> s.getOverallScore().doubleValue())
                .average().orElse(0.0);
 
        req.setAvgScore(Math.round(avg * 10.0) / 10.0);
        req.setTotalSessions(sessions.size());
 
        Map<String, Double> avgByType = sessions.stream()
                .filter(s -> s.getOverallScore() != null)
                .collect(Collectors.groupingBy(
                        s -> s.getSessionType().name(),
                        Collectors.averagingDouble(s -> s.getOverallScore().doubleValue())
                ));
 
        if (!avgByType.isEmpty()) {
            if (req.getWeakestCategory() == null) {
                req.setWeakestCategory(
                    avgByType.entrySet().stream()
                        .min(Map.Entry.comparingByValue())
                        .map(Map.Entry::getKey).orElse("DSA")
                );
            }
            if (req.getStrongestCategory() == null) {
                req.setStrongestCategory(
                    avgByType.entrySet().stream()
                        .max(Map.Entry.comparingByValue())
                        .map(Map.Entry::getKey).orElse("BEHAVIORAL")
                );
            }
        }
 
        if (req.getCategories() == null || req.getCategories().isEmpty()) {
            req.setCategories(List.of("DSA", "SYSTEM_DESIGN", "BEHAVIORAL", "MIXED"));
        }
 
        return req;
    }
 
    private String buildCacheKey(String userId, ResourceRequest req) {
        String cats  = req.getCategories() != null ? String.join(",", req.getCategories()) : "all";
        String depth = req.getPrepDepth()  != null ? req.getPrepDepth()  : "THOROUGH";
        String topic = req.getSpecificTopic() != null
                ? req.getSpecificTopic().toLowerCase().replaceAll("\\s+", "_") : "none";
        return CACHE_PREFIX + userId + ":" + cats + ":" + depth + ":" + topic;
    }
}
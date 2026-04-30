package com.example.AiInterviewSystem.service;

import com.example.AiInterviewSystem.dto.ScorePoint;
import com.example.AiInterviewSystem.dto.UserAnalyticsDashboard;
import com.example.AiInterviewSystem.model.InterviewAnswer;
import com.example.AiInterviewSystem.model.InterviewSession;
import com.example.AiInterviewSystem.model.TopicPerformance;
import com.example.AiInterviewSystem.model.User;
import com.example.AiInterviewSystem.repository.InterviewAnswerRepository;
import com.example.AiInterviewSystem.repository.InterviewSessionRepository;
import com.example.AiInterviewSystem.repository.TopicPerformanceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
 
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;
 
@Service
@RequiredArgsConstructor
@Slf4j
public class AnalyticsService {
 
    private final InterviewSessionRepository sessionRepository;
    private final InterviewAnswerRepository answerRepository;
    private final TopicPerformanceRepository topicRepository;
 
    // ─── Full dashboard for the logged-in user ───────────────────────────────
 
    @Transactional(readOnly = true)
    public UserAnalyticsDashboard getDashboard(User user) {
        UUID userId = user.getId();
        LocalDateTime since = LocalDateTime.now().minusDays(30);
 
        List<InterviewSession> sessions =
                sessionRepository.findByUserIdAndStartedAtAfter(userId, since);
 
        // Daily score trend (last 30 days)
        List<ScorePoint> scoreTrend = sessions.stream()
                .filter(s -> s.getOverallScore() != null)
                .collect(Collectors.groupingBy(
                        s -> s.getStartedAt().toLocalDate(),
                        Collectors.averagingDouble(s -> s.getOverallScore().doubleValue())
                ))
                .entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(e -> new ScorePoint(
                        e.getKey().toString(),
                        round(e.getValue())))
                .toList();
 
        // Per-category average scores
        Map<String, Double> categoryScores = sessions.stream()
                .filter(s -> s.getOverallScore() != null)
                .collect(Collectors.groupingBy(
                        s -> s.getSessionType().name(),
                        Collectors.averagingDouble(s -> s.getOverallScore().doubleValue())
                ));
 
        // Best + weakest topics
        List<TopicPerformance> topics = topicRepository.findByUserId(userId);
        List<String> strongTopics = topics.stream()
                .filter(t -> t.getAvgScore() != null && t.getAvgScore().doubleValue() >= 75)
                .map(TopicPerformance::getTopic).toList();
        List<String> weakTopics = topics.stream()
                .filter(t -> t.getAvgScore() != null && t.getAvgScore().doubleValue() < 60)
                .map(TopicPerformance::getTopic).toList();
 
        // Global average score
        double globalAvg = sessions.stream()
                .filter(s -> s.getOverallScore() != null)
                .mapToDouble(s -> s.getOverallScore().doubleValue())
                .average().orElse(0.0);
 
        // Total sessions (all time)
        long totalAllTime = sessionRepository.countByUserId(userId);
 
        // Completion rate (last 30 days)
        long completed = sessions.stream()
                .filter(s -> s.getStatus().name().equals("COMPLETED")).count();
        double completionRate = sessions.isEmpty() ? 0.0
                : round((double) completed / sessions.size() * 100);
 
        return UserAnalyticsDashboard.builder()
                .totalSessionsAllTime((int) totalAllTime)
                .totalSessionsLast30Days(sessions.size())
                .avgScore(round(globalAvg))
                .completionRatePercent(completionRate)
                .scoreTrend(scoreTrend)
                .categoryScores(categoryScores)
                .strongTopics(strongTopics)
                .weakTopics(weakTopics)
                .build();
    }
 
    // ─── Update topic performance after session completes ───────────────────
 
    @Transactional
    public void updateTopicPerformance(UUID sessionId, User user) {
        List<InterviewAnswer> answers = answerRepository.findBySessionId(sessionId);
        if (answers.isEmpty()) return;
 
        answers.forEach(answer -> {
            String topic       = answer.getQuestion().getQuestionType();
            String sessionType = answer.getSession().getSessionType().name();
 
            TopicPerformance tp = topicRepository
                    .findByUserIdAndTopicAndSessionType(user.getId(), topic, sessionType)
                    .orElse(TopicPerformance.builder()
                            .userId(user.getId())
                            .topic(topic)
                            .sessionType(sessionType)
                            .attempts(0)
                            .build());
 
            // Recalculate rolling average
            int newAttempts = tp.getAttempts() + 1;
            double currentAvg = tp.getAvgScore() != null ? tp.getAvgScore().doubleValue() : 0.0;
            double newScore   = answer.getOverallScore() != null ? answer.getOverallScore().doubleValue() : 0.0;
            double newAvg     = ((currentAvg * tp.getAttempts()) + newScore) / newAttempts;
 
            tp.setAttempts(newAttempts);
            tp.setAvgScore(BigDecimal.valueOf(newAvg).setScale(2, RoundingMode.HALF_UP));
            tp.setLastAttempted(LocalDateTime.now());
 
            topicRepository.save(tp);
        });
 
        log.info("Updated topic performance for session {}", sessionId);
    }
 
    private double round(double value) {
        return BigDecimal.valueOf(value).setScale(2, RoundingMode.HALF_UP).doubleValue();
    }
}
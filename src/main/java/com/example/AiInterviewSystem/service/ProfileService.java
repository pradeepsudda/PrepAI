package com.example.AiInterviewSystem.service;

import com.example.AiInterviewSystem.dto.*;
import com.example.AiInterviewSystem.enums.SessionStatus;
import com.example.AiInterviewSystem.enums.SessionType;
import com.example.AiInterviewSystem.exceptions.ResourceNotFoundException;
import com.example.AiInterviewSystem.model.InterviewAnswer;
import com.example.AiInterviewSystem.model.InterviewSession;
import com.example.AiInterviewSystem.model.User;
import com.example.AiInterviewSystem.repository.InterviewAnswerRepository;
import com.example.AiInterviewSystem.repository.InterviewSessionRepository;
import com.example.AiInterviewSystem.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
 
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;
 
@Service
@RequiredArgsConstructor
@Slf4j
public class ProfileService {
 
    private final UserRepository              userRepository;
    private final InterviewSessionRepository  sessionRepository;
    private final InterviewAnswerRepository   answerRepository;
    private final PasswordEncoder             passwordEncoder;

    @Transactional(readOnly = true)
    public ProfileDto getProfile(User user) {
        return ProfileDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole().name())
                .bio(user.getBio())
                .location(user.getLocation())
                .createdAt(user.getCreatedAt())
                .githubUrl(user.getGithubUrl())
                .linkedinUrl(user.getLinkedinUrl())
                .leetcodeUrl(user.getLeetcodeUrl())
                .hackerrankUrl(user.getHackerrankUrl())
                .codeforcesUrl(user.getCodeforcesUrl())
                .websiteUrl(user.getWebsiteUrl())
                .defaultDifficulty(user.getDefaultDifficulty())
                .preferredLanguage(user.getPreferredLanguage())
                .emailNotifications(user.isEmailNotifications())
                .stats(buildStats(user))
                .build();
    }

    @Transactional
    public ProfileDto updateProfile(UpdateProfileRequest request, User user) {
        if (request.getEmail() != null
                && !request.getEmail().equalsIgnoreCase(user.getEmail())
                && userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email is already in use by another account");
        }
 
        if (request.getFullName()          != null) user.setFullName(request.getFullName().trim());
        if (request.getEmail()             != null) user.setEmail(request.getEmail().toLowerCase().trim());
        if (request.getBio()               != null) user.setBio(request.getBio().trim());
        if (request.getLocation()          != null) user.setLocation(request.getLocation().trim());
        if (request.getGithubUrl()         != null) user.setGithubUrl(sanitizeUrl(request.getGithubUrl()));
        if (request.getLinkedinUrl()       != null) user.setLinkedinUrl(sanitizeUrl(request.getLinkedinUrl()));
        if (request.getLeetcodeUrl()       != null) user.setLeetcodeUrl(sanitizeUrl(request.getLeetcodeUrl()));
        if (request.getHackerrankUrl()     != null) user.setHackerrankUrl(sanitizeUrl(request.getHackerrankUrl()));
        if (request.getCodeforcesUrl()     != null) user.setCodeforcesUrl(sanitizeUrl(request.getCodeforcesUrl()));
        if (request.getWebsiteUrl()        != null) user.setWebsiteUrl(sanitizeUrl(request.getWebsiteUrl()));
        if (request.getDefaultDifficulty() != null) user.setDefaultDifficulty(request.getDefaultDifficulty());
        if (request.getPreferredLanguage() != null) user.setPreferredLanguage(request.getPreferredLanguage());
        if (request.getEmailNotifications() != null) user.setEmailNotifications(request.getEmailNotifications());
 
        userRepository.save(user);
        log.info("Profile updated for user {}", user.getId());
        return getProfile(user);
    }

    @Transactional
    public void changePassword(ChangePasswordRequest request, User user) {
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Current password is incorrect");
        }
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        log.info("Password changed for user {}", user.getId());
    }

    @Transactional
    public void deleteAccount(String confirmPassword, User user) {
        if (!passwordEncoder.matches(confirmPassword, user.getPassword())) {
            throw new IllegalArgumentException("Password confirmation is incorrect");
        }
        userRepository.delete(user);
        log.info("Account deleted for user {}", user.getId());
    }

    private ProfileStatsDto buildStats(User user) {
        List<InterviewSession> allSessions =
                sessionRepository.findByUserIdOrderByStartedAtDesc(user.getId());
 
        if (allSessions.isEmpty()) {
            return ProfileStatsDto.builder()
                    .totalSessions(0).completedSessions(0).avgScore(0).bestScore(0)
                    .totalQuestionsAnswered(0).totalPracticeMinutes(0)
                    .currentStreak(0).longestStreak(0)
                    .strongestCategory("—").weakestCategory("—")
                    .build();
        }
 
        long completed  = allSessions.stream().filter(s -> s.getStatus() == SessionStatus.COMPLETED).count();
        long abandoned  = allSessions.stream().filter(s -> s.getStatus() == SessionStatus.ABANDONED).count();
 
        List<Double> scores = allSessions.stream()
                .filter(s -> s.getOverallScore() != null)
                .map(s -> s.getOverallScore().doubleValue())
                .toList();
 
        double avgScore  = scores.stream().mapToDouble(d -> d).average().orElse(0);
        double bestScore = scores.stream().mapToDouble(d -> d).max().orElse(0);
 
        List<InterviewAnswer> allAnswers = answerRepository.findBySessionIds(
                allSessions.stream().map(InterviewSession::getId).toList()
        );
 
        long totalMinutes = allSessions.stream()
                .filter(s -> s.getStartedAt() != null && s.getCompletedAt() != null)
                .mapToLong(s -> java.time.Duration.between(
                        s.getStartedAt(), s.getCompletedAt()).toMinutes())
                .sum();
 
        Map<SessionType, Long> byType = allSessions.stream()
                .collect(Collectors.groupingBy(InterviewSession::getSessionType, Collectors.counting()));
 
        Map<String, Double> avgByType = allSessions.stream()
                .filter(s -> s.getOverallScore() != null)
                .collect(Collectors.groupingBy(
                        s -> s.getSessionType().name(),
                        Collectors.averagingDouble(s -> s.getOverallScore().doubleValue())
                ));
 
        String strongest = avgByType.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey).orElse("—");
 
        String weakest = avgByType.entrySet().stream()
                .min(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey).orElse("—");
 
        int[] streaks = calculateStreaks(allSessions);
 
        return ProfileStatsDto.builder()
                .totalSessions(allSessions.size())
                .completedSessions((int) completed)
                .abandonedSessions((int) abandoned)
                .avgScore(Math.round(avgScore * 10.0) / 10.0)
                .bestScore(Math.round(bestScore * 10.0) / 10.0)
                .totalQuestionsAnswered(allAnswers.size())
                .totalPracticeMinutes(totalMinutes)
                .currentStreak(streaks[0])
                .longestStreak(streaks[1])
                .strongestCategory(strongest)
                .weakestCategory(weakest)
                .dsaSessions(byType.getOrDefault(SessionType.DSA, 0L).intValue())
                .systemDesignSessions(byType.getOrDefault(SessionType.SYSTEM_DESIGN, 0L).intValue())
                .behavioralSessions(byType.getOrDefault(SessionType.BEHAVIORAL, 0L).intValue())
                .mixedSessions(byType.getOrDefault(SessionType.MIXED, 0L).intValue())
                .build();
    }
 
    private int[] calculateStreaks(List<InterviewSession> sessions) {
        if (sessions.isEmpty()) return new int[]{0, 0};
 
        Set<LocalDate> activeDays = sessions.stream()
                .map(s -> s.getStartedAt().toLocalDate())
                .collect(Collectors.toSet());
 
        List<LocalDate> sortedDays = activeDays.stream().sorted().toList();
 
        int current = 0, longest = 0, streak = 1;
        LocalDate today = LocalDate.now();
 
        for (int i = 0; i < 365; i++) {
            if (activeDays.contains(today.minusDays(i))) current++;
            else break;
        }
 
        for (int i = 1; i < sortedDays.size(); i++) {
            if (sortedDays.get(i).equals(sortedDays.get(i - 1).plusDays(1))) {
                streak++;
                longest = Math.max(longest, streak);
            } else {
                streak = 1;
            }
        }
        longest = Math.max(longest, current);
 
        return new int[]{current, longest};
    }
 
    private String sanitizeUrl(String url) {
        if (url == null || url.isBlank()) return null;
        String trimmed = url.trim();
        if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
            trimmed = "https://" + trimmed;
        }
        return trimmed;
    }
}
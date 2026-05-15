package com.example.AiInterviewSystem.service;

import com.example.AiInterviewSystem.dto.*;
import com.example.AiInterviewSystem.dto.AnswerEvaluation;
import com.example.AiInterviewSystem.enums.QuestionMode;
import com.example.AiInterviewSystem.enums.SessionStatus;
import com.example.AiInterviewSystem.enums.SessionType;
import com.example.AiInterviewSystem.exceptions.*;
import com.example.AiInterviewSystem.model.*;
import com.example.AiInterviewSystem.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
 
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
 
@Service
@RequiredArgsConstructor
@Slf4j
public class InterviewService {
 
    private final InterviewSessionRepository  sessionRepository;
    private final InterviewQuestionRepository questionRepository;
    private final InterviewAnswerRepository   answerRepository;
    private final AIOrchestrationService      aiService;
 
    private static final int MAX_DSA_QUESTIONS           = 3;
    private static final int MAX_SYSTEM_DESIGN_QUESTIONS = 2;
    private static final int MAX_BEHAVIORAL_QUESTIONS    = 5;
    private static final int MAX_MIXED_QUESTIONS         = 5;
 
    @Transactional
    public InterviewSessionDto createSession(CreateSessionRequest request, User user) {
        InterviewSession session = InterviewSession.builder()
                .user(user)
                .sessionType(request.getSessionType())
                .difficulty(request.getDifficulty())
                .topic(request.getTopic())
                .status(SessionStatus.IN_PROGRESS)
                .totalQuestions(resolveMaxQuestions(request.getSessionType()))
                .startedAt(LocalDateTime.now())
                .build();
        session = sessionRepository.save(session);
        log.info("Session created: {} type={}", session.getId(), session.getSessionType());
        return mapToSessionDto(session);
    }
 
    @Transactional
    public QuestionDto generateNextQuestion(UUID sessionId, User user) {
        InterviewSession session = getSessionAndVerifyOwner(sessionId, user);
        validateSessionInProgress(session);
 
        int questionCount = questionRepository.countBySessionId(sessionId);
        int maxQuestions  = resolveMaxQuestions(session.getSessionType());
 
        if (questionCount >= maxQuestions) {
            throw new SessionCompletedException(
                    "All " + maxQuestions + " questions have been asked.");
        }
 
        String lastAnswer       = getLastAnswerText(sessionId);
        String lastQuestionText = getLastQuestionText(sessionId);
        boolean generateFollowUp = lastAnswer != null
                && lastQuestionText != null
                && questionCount % 3 == 0
                && questionCount > 0;
 
        // ✅ Now returns GeneratedQuestion (not plain String)
        GeneratedQuestion generated;
        if (generateFollowUp) {
            FollowUpRequest followUp = FollowUpRequest.builder()
                    .originalQuestion(lastQuestionText)
                    .candidateAnswer(lastAnswer)
                    .sessionType(session.getSessionType())
                    .difficulty(session.getDifficulty())
                    .build();
            generated = aiService.generateFollowUp(followUp).block();
        } else {
            QuestionRequest qReq = QuestionRequest.builder()
                    .sessionType(session.getSessionType())
                    .difficulty(session.getDifficulty())
                    .topic(session.getTopic())
                    .questionsAsked(questionCount)
                    .previousAnswer(lastAnswer)
                    .build();
            generated = aiService.generateQuestion(qReq).block();
        }
 
        if (generated == null || generated.getQuestionText() == null || generated.getQuestionText().isBlank()) {
            throw new AIResponseException("AI returned empty question");
        }
 
        // ✅ Parse mode from AI response
        QuestionMode mode = generated.parsedMode();
 
        // ✅ Auto time limit: CODE gets 1800s, VOICE gets type-based limit
        int timeLimit = mode == QuestionMode.CODE
                ? 1800
                : resolveVoiceTimeLimit(session.getSessionType());
 
        InterviewQuestion question = InterviewQuestion.builder()
                .session(session)
                .questionText(generated.getQuestionText().trim())
                .questionType(session.getSessionType().name())
                .orderIndex(questionCount)
                .timeLimitSec(timeLimit)
                .questionMode(mode)                              // ✅ NEW
                .suggestedLanguage(generated.getSuggestedLanguage())  // ✅ NEW
                .build();
 
        question = questionRepository.save(question);
        log.info("Question {} saved: mode={} lang={}", question.getId(), mode, generated.getSuggestedLanguage());
 
        return mapToQuestionDto(question, questionCount + 1, maxQuestions);
    }
 
    @Transactional
    public AnswerFeedbackDto submitAndEvaluate(UUID sessionId,
                                               SubmitAnswerRequest request,
                                               User user) {
        InterviewSession session = getSessionAndVerifyOwner(sessionId, user);
        validateSessionInProgress(session);
 
        InterviewQuestion question = questionRepository.findById(request.getQuestionId())
                .orElseThrow(() -> new ResourceNotFoundException("Question not found: " + request.getQuestionId()));
 
        if (!question.getSession().getId().equals(sessionId)) {
            throw new UnauthorizedException("Question does not belong to this session");
        }
        if (answerRepository.findByQuestionId(question.getId()).isPresent()) {
            throw new IllegalStateException("This question has already been answered");
        }
 
        // ✅ Pass questionMode to evaluation so AI applies correct rubric
        EvaluationRequest evalRequest = EvaluationRequest.builder()
                .questionText(question.getQuestionText())
                .questionType(question.getQuestionType())
                .difficulty(session.getDifficulty())
                .answerText(request.getAnswerText())
                .questionMode(question.getQuestionMode().name())  // ✅ NEW
                .build();
 
        AnswerEvaluation evaluation = aiService.evaluateAnswer(evalRequest).block();
        if (evaluation == null) throw new AIResponseException("AI returned null evaluation");
 
        InterviewAnswer answer = InterviewAnswer.builder()
                .question(question)
                .session(session)
                .answerText(request.getAnswerText())
                .audioDuration(request.getAudioDuration())
                .technicalScore(toBigDecimal(evaluation.getTechnicalScore()))
                .clarityScore(toBigDecimal(evaluation.getClarityScore()))
                .confidenceScore(toBigDecimal(evaluation.getConfidenceScore()))
                .overallScore(toBigDecimal(evaluation.getOverallScore()))
                .feedbackText(evaluation.getFeedbackText())
                .strengths(toArray(evaluation.getStrengths()))
                .improvements(toArray(evaluation.getImprovements()))
                .answeredAt(LocalDateTime.now())
                .build();
 
        answerRepository.save(answer);
        return mapToFeedbackDto(answer, evaluation.getModelAnswer());
    }
 
    @Transactional
    public SessionSummaryDto completeSession(UUID sessionId, User user) {
        InterviewSession session = getSessionAndVerifyOwner(sessionId, user);
        if (session.getStatus() == SessionStatus.COMPLETED) return buildSessionSummary(session);
 
        List<InterviewAnswer> answers = answerRepository.findBySessionId(sessionId);
        double avgScore = answers.stream()
                .filter(a -> a.getOverallScore() != null)
                .mapToDouble(a -> a.getOverallScore().doubleValue())
                .average().orElse(0.0);
 
        session.setStatus(SessionStatus.COMPLETED);
        session.setCompletedAt(LocalDateTime.now());
        session.setOverallScore(toBigDecimal(avgScore));
        sessionRepository.save(session);
        return buildSessionSummary(session);
    }
 
    @Transactional
    public void abandonSession(UUID sessionId, User user) {
        InterviewSession session = getSessionAndVerifyOwner(sessionId, user);
        if (session.getStatus() == SessionStatus.IN_PROGRESS) {
            session.setStatus(SessionStatus.ABANDONED);
            session.setCompletedAt(LocalDateTime.now());
            sessionRepository.save(session);
        }
    }
 
    @Transactional(readOnly = true)
    public List<InterviewSessionDto> getUserSessions(User user) {
        return sessionRepository.findByUserIdOrderByStartedAtDesc(user.getId())
                .stream().map(this::mapToSessionDto).toList();
    }
 
    @Transactional(readOnly = true)
    public SessionDetailDto getSessionDetail(UUID sessionId, User user) {
        InterviewSession session = getSessionAndVerifyOwner(sessionId, user);
        List<QuestionWithAnswerDto> qaList = questionRepository
                .findBySessionIdOrderByOrderIndex(sessionId).stream()
                .map(q -> {
                    InterviewAnswer ans = answerRepository.findByQuestionId(q.getId()).orElse(null);
                    return mapToQuestionWithAnswer(q, ans);
                }).toList();
        return SessionDetailDto.builder().session(mapToSessionDto(session))
                .questionsAndAnswers(qaList).build();
    }
 
    // ─── Helpers ─────────────────────────────────────────────────────────────
 
    private InterviewSession getSessionAndVerifyOwner(UUID sessionId, User user) {
        InterviewSession s = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Session not found: " + sessionId));
        if (!s.getUser().getId().equals(user.getId()))
            throw new UnauthorizedException("You do not own this session");
        return s;
    }
 
    private void validateSessionInProgress(InterviewSession session) {
        if (session.getStatus() != SessionStatus.IN_PROGRESS)
            throw new IllegalStateException("Session is not in progress: " + session.getStatus());
    }
 
    private String getLastAnswerText(UUID sessionId) {
        return answerRepository.findTopBySessionIdOrderByAnsweredAtDesc(sessionId)
                .map(InterviewAnswer::getAnswerText).orElse(null);
    }
 
    private String getLastQuestionText(UUID sessionId) {
        return questionRepository.findTopBySessionIdOrderByOrderIndexDesc(sessionId)
                .map(InterviewQuestion::getQuestionText).orElse(null);
    }
 
    private int resolveMaxQuestions(SessionType type) {
        return switch (type) {
            case DSA           -> MAX_DSA_QUESTIONS;
            case SYSTEM_DESIGN -> MAX_SYSTEM_DESIGN_QUESTIONS;
            case BEHAVIORAL    -> MAX_BEHAVIORAL_QUESTIONS;
            case MIXED         -> MAX_MIXED_QUESTIONS;
        };
    }
 
    // Voice-mode time limits per session type
    private int resolveVoiceTimeLimit(SessionType type) {
        return switch (type) {
            case DSA           -> 300;
            case SYSTEM_DESIGN -> 2700;
            case BEHAVIORAL    -> 300;
            case MIXED         -> 600;
        };
    }
 
    private BigDecimal toBigDecimal(double value) {
        return BigDecimal.valueOf(value).setScale(2, RoundingMode.HALF_UP);
    }
 
    private String[] toArray(List<String> list) {
        return list != null ? list.toArray(new String[0]) : new String[0];
    }
 
    private InterviewSessionDto mapToSessionDto(InterviewSession s) {
        return InterviewSessionDto.builder()
                .id(s.getId()).sessionType(s.getSessionType()).difficulty(s.getDifficulty())
                .topic(s.getTopic()).status(s.getStatus()).totalQuestions(s.getTotalQuestions())
                .startedAt(s.getStartedAt()).completedAt(s.getCompletedAt())
                .overallScore(s.getOverallScore()).build();
    }
 
    private QuestionDto mapToQuestionDto(InterviewQuestion q, int num, int total) {
        return QuestionDto.builder()
                .id(q.getId()).questionText(q.getQuestionText()).questionType(q.getQuestionType())
                .orderIndex(q.getOrderIndex()).timeLimitSec(q.getTimeLimitSec())
                .currentNumber(num).totalQuestions(total)
                .questionMode(q.getQuestionMode())           // ✅ NEW
                .suggestedLanguage(q.getSuggestedLanguage()) // ✅ NEW
                .build();
    }
 
    private AnswerFeedbackDto mapToFeedbackDto(InterviewAnswer a, String modelAnswer) {
        return AnswerFeedbackDto.builder()
                .answerId(a.getId()).technicalScore(a.getTechnicalScore())
                .clarityScore(a.getClarityScore()).confidenceScore(a.getConfidenceScore())
                .overallScore(a.getOverallScore()).feedbackText(a.getFeedbackText())
                .strengths(List.of(a.getStrengths())).improvements(List.of(a.getImprovements()))
                .modelAnswer(modelAnswer).build();
    }
 
    private QuestionWithAnswerDto mapToQuestionWithAnswer(InterviewQuestion q, InterviewAnswer a) {
        return QuestionWithAnswerDto.builder()
                .question(mapToQuestionDto(q, q.getOrderIndex() + 1, 0))
                .answer(a != null ? mapToFeedbackDto(a, null) : null).build();
    }
 
    private SessionSummaryDto buildSessionSummary(InterviewSession session) {
        List<InterviewAnswer> answers = answerRepository.findBySessionId(session.getId());
        List<String> strengths = answers.stream()
                .filter(a -> a.getStrengths() != null)
                .flatMap(a -> List.of(a.getStrengths()).stream())
                .distinct().limit(5).toList();
        List<String> improvements = answers.stream()
                .filter(a -> a.getImprovements() != null)
                .flatMap(a -> List.of(a.getImprovements()).stream())
                .distinct().limit(5).toList();
        long minutes = 0;
        if (session.getStartedAt() != null && session.getCompletedAt() != null)
            minutes = java.time.Duration.between(session.getStartedAt(), session.getCompletedAt()).toMinutes();
 
        return SessionSummaryDto.builder()
                .sessionId(session.getId()).overallScore(session.getOverallScore())
                .avgTechnicalScore(toBigDecimal(avg(answers, "technical")))
                .avgClarityScore(toBigDecimal(avg(answers, "clarity")))
                .avgConfidenceScore(toBigDecimal(avg(answers, "confidence")))
                .totalQuestionsAnswered(answers.size())
                .durationMinutes(minutes).topStrengths(strengths).topImprovements(improvements)
                .completedAt(session.getCompletedAt()).build();
    }
 
    private double avg(List<InterviewAnswer> answers, String type) {
        return answers.stream().mapToDouble(a -> switch (type) {
            case "technical"  -> a.getTechnicalScore()  != null ? a.getTechnicalScore().doubleValue()  : 0;
            case "clarity"    -> a.getClarityScore()    != null ? a.getClarityScore().doubleValue()    : 0;
            case "confidence" -> a.getConfidenceScore() != null ? a.getConfidenceScore().doubleValue() : 0;
            default -> 0;
        }).average().orElse(0.0);
    }
}
 
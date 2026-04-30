package com.example.AiInterviewSystem.service;

import com.example.AiInterviewSystem.dto.AnswerEvaluation;
import com.example.AiInterviewSystem.dto.EvaluationRequest;
import com.example.AiInterviewSystem.dto.FollowUpRequest;
import com.example.AiInterviewSystem.dto.QuestionRequest;
import com.example.AiInterviewSystem.enums.SessionType;
import com.example.AiInterviewSystem.exceptions.AIResponseException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class AIOrchestrationService {

    private final WebClient webClient;
    private final ObjectMapper objectMapper;

    @Value("${ai.openai.api-key}")
    private String apiKey;

    @Value("${ai.openai.base-url}")   // ← NEW
    private String baseUrl;

    @Value("${ai.openai.model}")
    private String model;

    @Value("${ai.openai.max-tokens}")
    private int maxTokens;

    // ─── Generate opening/next question ─────────────────────────────────────

    public Mono<String> generateQuestion(QuestionRequest request) {
        String systemPrompt = buildSystemPrompt(request.getSessionType());
        String userPrompt   = buildQuestionPrompt(request);
        return callOpenAI(systemPrompt, userPrompt);
    }

    // ─── Generate follow-up based on candidate's previous answer ────────────

    public Mono<String> generateFollowUp(FollowUpRequest request) {
        String systemPrompt = """
                You are an expert technical interviewer conducting a real interview.
                Based on the candidate's previous answer, generate ONE sharp follow-up
                question that probes a gap, assumption, or edge case in their response.
                Return ONLY the question text — no labels, no numbering, no preamble.
                """;

        String userPrompt = String.format("""
                Original question: %s

                Candidate's answer: %s

                Interview type: %s
                Difficulty: %s

                Generate a follow-up question that:
                1. Probes a gap or edge case in their answer
                2. Tests deeper understanding
                3. Is realistic for a %s %s interview
                """,
                request.getOriginalQuestion(),
                request.getCandidateAnswer(),
                request.getSessionType(),
                request.getDifficulty(),
                request.getDifficulty(),
                request.getSessionType()
        );

        return callOpenAI(systemPrompt, userPrompt);
    }

    // ─── Evaluate candidate answer and return structured scores ─────────────

    public Mono<AnswerEvaluation> evaluateAnswer(EvaluationRequest request) {
        String systemPrompt = """
                You are a senior technical interviewer evaluating a candidate's answer.
                You must respond with a valid JSON object ONLY — no markdown, no code fences,
                no explanation text before or after the JSON.
                Scores are integers from 0 to 100. Be fair but rigorous.
                """;

        String userPrompt = String.format("""
                Evaluate this interview answer:

                Question: %s
                Question Type: %s
                Difficulty: %s
                Candidate's Answer: %s

                Respond with ONLY this JSON structure (no extra text):
                {
                  "technicalScore": <0-100>,
                  "clarityScore": <0-100>,
                  "confidenceScore": <0-100>,
                  "overallScore": <0-100>,
                  "feedbackText": "<2-3 sentence balanced summary>",
                  "strengths": ["<strength 1>", "<strength 2>"],
                  "improvements": ["<area 1>", "<area 2>"],
                  "modelAnswer": "<concise outline of an ideal answer>"
                }
                """,
                request.getQuestionText(),
                request.getQuestionType(),
                request.getDifficulty(),
                request.getAnswerText()
        );

        return callOpenAI(systemPrompt, userPrompt)
                .map(this::parseEvaluation);
    }

    // ─── Parse resume text into structured profile ───────────────────────────

    public Mono<String> parseResume(String resumeText) {
        String systemPrompt = """
                You extract structured data from resume text.
                Respond with valid JSON ONLY — no markdown, no extra text.
                """;

        String userPrompt = String.format("""
                Parse this resume and extract key information.
                Return ONLY valid JSON with this exact structure:
                {
                  "skills": ["skill1", "skill2"],
                  "experienceYears": 3,
                  "seniorityLevel": "MID",
                  "companies": ["Company A"],
                  "roles": ["Software Engineer"],
                  "techStack": ["Java", "React"],
                  "focusAreas": ["Backend", "Distributed Systems"]
                }

                Resume text:
                %s
                """, resumeText);

        return callOpenAI(systemPrompt, userPrompt);
    }

    // ─── Core API call — works for both GitHub Models and Groq ──────────────

    @SuppressWarnings("unchecked")
    private Mono<String> callOpenAI(String systemPrompt, String userPrompt) {
        var requestBody = Map.of(
                "model",       model,
                "max_tokens",  maxTokens,
                "temperature", 0.7,
                "messages", List.of(
                        Map.of("role", "system", "content", systemPrompt),
                        Map.of("role", "user",   "content", userPrompt)
                )
        );

        return webClient.post()
                .uri(baseUrl + "/chat/completions")   // ← ONLY LINE THAT CHANGED
                .header("Authorization", "Bearer " + apiKey)
                .header("Content-Type",  "application/json")
                .bodyValue(requestBody)
                .retrieve()
                .onStatus(status -> status.is4xxClientError(), response ->
                        response.bodyToMono(String.class)
                                .map(body -> new AIResponseException("AI 4xx: " + body)))
                .onStatus(status -> status.is5xxServerError(), response ->
                        response.bodyToMono(String.class)
                                .map(body -> new AIResponseException("AI 5xx: " + body)))
                .bodyToMono(Map.class)
                .map(response -> {
                    var choices = (List<Map<String, Object>>) response.get("choices");
                    var message = (Map<String, Object>) choices.get(0).get("message");
                    return ((String) message.get("content")).trim();
                })
                .doOnError(e -> log.error("AI API error: {}", e.getMessage()));
    }

    private AnswerEvaluation parseEvaluation(String json) {
        try {
            String clean = json.replaceAll("```json", "")
                    .replaceAll("```", "")
                    .trim();
            return objectMapper.readValue(clean, AnswerEvaluation.class);
        } catch (Exception e) {
            log.error("Failed to parse evaluation JSON: {}\nRaw: {}", e.getMessage(), json);
            throw new AIResponseException("Failed to parse AI evaluation response");
        }
    }

    // ─── System prompts per session type ────────────────────────────────────

    private String buildSystemPrompt(SessionType type) {
        return switch (type) {
            case DSA -> """
                    You are a senior software engineer conducting a Data Structures & Algorithms interview.
                    Generate clear, unambiguous coding problems with realistic constraints.
                    Always include: problem statement, constraints, and 1-2 input/output examples.
                    Return ONLY the question text — no preamble, no numbering.
                    """;
            case SYSTEM_DESIGN -> """
                    You are a Staff Engineer conducting system design interviews.
                    Ask candidates to design real-world distributed systems (e.g. URL shortener,
                    ride-sharing backend, notification service, distributed cache).
                    Focus on scalability, reliability, and trade-offs.
                    Return ONLY the question text — no preamble, no numbering.
                    """;
            case BEHAVIORAL -> """
                    You are an Engineering Manager conducting behavioral interviews using the STAR method.
                    Ask about real professional situations: teamwork, conflict resolution, leadership,
                    handling failure, tight deadlines, and cross-functional collaboration.
                    Return ONLY the question text — no preamble, no numbering.
                    """;
            case MIXED -> """
                    You are a senior technical interviewer conducting a full-stack interview.
                    Alternate between technical questions (DSA, system design) and behavioral questions.
                    Return ONLY the question text — no preamble, no numbering.
                    """;
        };
    }

    private String buildQuestionPrompt(QuestionRequest request) {
        return String.format("""
                Generate ONE interview question.

                Interview type: %s
                Difficulty: %s
                Topic focus: %s
                Questions already asked this session: %d

                Rules:
                - Return ONLY the question text
                - No numbering, no labels, no preamble
                - Be specific and concrete
                - For DSA: include constraints and at least one example
                - For System Design: name a real product or use-case
                - For Behavioral: start with "Tell me about a time..." or similar opener
                - Vary from what was already asked (question %d in session)
                """,
                request.getSessionType(),
                request.getDifficulty(),
                request.getTopic() != null ? request.getTopic() : "general",
                request.getQuestionsAsked(),
                request.getQuestionsAsked() + 1
        );
    }
}
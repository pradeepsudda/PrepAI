package com.example.AiInterviewSystem.service;

import com.example.AiInterviewSystem.dto.AnswerEvaluation;
import com.example.AiInterviewSystem.dto.EvaluationRequest;
import com.example.AiInterviewSystem.dto.FollowUpRequest;
import com.example.AiInterviewSystem.dto.GeneratedQuestion;
import com.example.AiInterviewSystem.dto.QuestionRequest;
import com.example.AiInterviewSystem.dto.ResourceRequest;
import com.example.AiInterviewSystem.dto.ResourcesResponse;
import com.example.AiInterviewSystem.enums.QuestionMode;
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
 
    private final WebClient    webClient;
    private final ObjectMapper objectMapper;
 
    @Value("${ai.openai.api-key}")
    private String apiKey;
 
    @Value("${ai.openai.base-url}")
    private String baseUrl;
 
    @Value("${ai.openai.model}")
    private String model;
 
    @Value("${ai.openai.max-tokens}")
    private int maxTokens;
 
    // ─── Generate question — returns GeneratedQuestion (with mode) ───────────
 
    public Mono<GeneratedQuestion> generateQuestion(QuestionRequest request) {
        String systemPrompt = buildSystemPrompt(request.getSessionType());
        String userPrompt   = buildQuestionPrompt(request);
        return callOpenAI(systemPrompt, userPrompt)
                .map(this::parseGeneratedQuestion);
    }
 
    // ─── Generate follow-up — also returns GeneratedQuestion ────────────────
 
    public Mono<GeneratedQuestion> generateFollowUp(FollowUpRequest request) {
        String systemPrompt = """
                You are an expert technical interviewer.
                Based on the candidate's previous answer, generate ONE follow-up question.
                
                You MUST respond with ONLY this JSON — no markdown, no extra text:
                {
                  "questionText": "<the follow-up question>",
                  "questionMode": "VOICE",
                  "suggestedLanguage": null
                }
                Follow-up questions are always verbal (VOICE mode).
                """;
 
        String userPrompt = String.format("""
                Original question: %s
                Candidate's answer: %s
                Interview type: %s
                Difficulty: %s
                
                Generate ONE sharp follow-up that probes a gap or edge case.
                """,
                request.getOriginalQuestion(),
                request.getCandidateAnswer(),
                request.getSessionType(),
                request.getDifficulty()
        );
 
        return callOpenAI(systemPrompt, userPrompt)
                .map(this::parseGeneratedQuestion);
    }
 
    // ─── Evaluate answer — handles both VOICE transcript and CODE text ────────
 
    public Mono<AnswerEvaluation> evaluateAnswer(EvaluationRequest request) {
        String systemPrompt = """
                You are a senior technical interviewer evaluating a candidate's answer.
                Respond with a valid JSON object ONLY — no markdown, no code fences.
                Scores are integers 0-100. Be fair but rigorous.
                
                When evaluating CODE answers:
                - technicalScore: correctness, time/space complexity, edge cases
                - clarityScore: code readability, naming, structure
                - confidenceScore: completeness of solution
                
                When evaluating VOICE answers:
                - technicalScore: accuracy and depth of technical content
                - clarityScore: communication clarity and structure
                - confidenceScore: confidence and delivery
                """;
 
        String userPrompt = String.format("""
                Evaluate this interview answer:
                
                Question: %s
                Answer Mode: %s
                Question Type: %s
                Difficulty: %s
                Candidate's Answer:
                %s
                
                Respond with ONLY this JSON:
                {
                  "technicalScore": <0-100>,
                  "clarityScore": <0-100>,
                  "confidenceScore": <0-100>,
                  "overallScore": <0-100>,
                  "feedbackText": "<2-3 sentence summary>",
                  "strengths": ["<strength 1>", "<strength 2>"],
                  "improvements": ["<area 1>", "<area 2>"],
                  "modelAnswer": "<concise ideal answer outline>"
                }
                """,
                request.getQuestionText(),
                request.getQuestionMode() != null ? request.getQuestionMode() : "VOICE",
                request.getQuestionType(),
                request.getDifficulty(),
                request.getAnswerText()
        );
 
        return callOpenAI(systemPrompt, userPrompt)
                .map(this::parseEvaluation);
    }
 
    // ─── Resume parsing ───────────────────────────────────────────────────────
 
    public Mono<String> parseResume(String resumeText) {
        String systemPrompt = """
                You extract structured data from resume text.
                Respond with valid JSON ONLY — no markdown, no extra text.
                """;
        String userPrompt = String.format("""
                Parse this resume. Return ONLY valid JSON:
                {
                  "skills": ["skill1"],
                  "experienceYears": 3,
                  "seniorityLevel": "MID",
                  "companies": ["Company A"],
                  "roles": ["Software Engineer"],
                  "techStack": ["Java", "React"],
                  "focusAreas": ["Backend"]
                }
                Resume: %s
                """, resumeText);
        return callOpenAI(systemPrompt, userPrompt);
    }
 
    // ─── Core OpenAI / GitHub Models call ────────────────────────────────────
 
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
                .uri(baseUrl + "/chat/completions")
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
 
    // ─── Parsers ─────────────────────────────────────────────────────────────
 
    private GeneratedQuestion parseGeneratedQuestion(String json) {
        try {
            String clean = json.replaceAll("```json", "").replaceAll("```", "").trim();
            return objectMapper.readValue(clean, GeneratedQuestion.class);
        } catch (Exception e) {
            log.error("Failed to parse generated question JSON: {}\nRaw: {}", e.getMessage(), json);
            // Fallback: treat entire response as plain-text VOICE question
            GeneratedQuestion fallback = new GeneratedQuestion();
            fallback.setQuestionText(json.replaceAll("[{}\"\\[\\]]", "").trim());
            fallback.setQuestionMode("VOICE");
            fallback.setSuggestedLanguage(null);
            return fallback;
        }
    }
 
    private AnswerEvaluation parseEvaluation(String json) {
        try {
            String clean = json.replaceAll("```json", "").replaceAll("```", "").trim();
            return objectMapper.readValue(clean, AnswerEvaluation.class);
        } catch (Exception e) {
            log.error("Failed to parse evaluation JSON: {}\nRaw: {}", e.getMessage(), json);
            throw new AIResponseException("Failed to parse AI evaluation response");
        }
    }
 
    // ─── System prompts ───────────────────────────────────────────────────────
 
    private String buildSystemPrompt(SessionType type) {
        String jsonSchema = """
                You MUST respond with ONLY this JSON — no markdown, no preamble, no extra text:
                {
                  "questionText": "<the full question>",
                  "questionMode": "<VOICE or CODE>",
                  "suggestedLanguage": "<python|java|javascript|cpp|go|null>"
                }
                """;
 
        return switch (type) {
            case DSA -> """
                    You are a senior software engineer conducting a DSA interview.
                    ALL DSA questions require writing code, so always use questionMode: CODE.
                    Pick a realistic language based on the difficulty and topic.
                    Include: problem statement, constraints, and 1-2 input/output examples.
                    """ + jsonSchema;
 
            case SYSTEM_DESIGN -> """
                    You are a Staff Engineer conducting system design interviews.
                    Most questions are verbal discussions (VOICE mode).
                    Only use CODE mode if asking the candidate to write pseudocode or
                    a specific algorithm/schema as part of the design.
                    Ask about real-world systems: URL shorteners, ride-sharing, notification services.
                    """ + jsonSchema;
 
            case BEHAVIORAL -> """
                    You are an Engineering Manager conducting behavioral interviews.
                    ALL behavioral questions are verbal — always use questionMode: VOICE.
                    suggestedLanguage must always be null.
                    Use STAR method prompts about teamwork, conflict, leadership, failure.
                    """ + jsonSchema;
 
            case MIXED -> """
                    You are a senior technical interviewer conducting a full-stack interview.
                    Vary question types — mix coding problems with verbal/behavioral questions.
                    Use questionMode: CODE for algorithm/coding questions.
                    Use questionMode: VOICE for design, behavioral, and conceptual questions.
                    For CODE questions, pick the most appropriate language.
                    """ + jsonSchema;
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
                - Return ONLY the JSON structure specified in the system prompt
                - Be specific and concrete
                - For CODE questions: include constraints and examples in questionText
                - For VOICE questions: frame as open-ended discussion
                - Vary from what was already asked (this is question %d)
                """,
                request.getSessionType(),
                request.getDifficulty(),
                request.getTopic() != null ? request.getTopic() : "general",
                request.getQuestionsAsked(),
                request.getQuestionsAsked() + 1
        );
    }

    public Mono<ResourcesResponse> generateResources(ResourceRequest request) {
        String systemPrompt = buildResourceSystemPrompt();
        String userPrompt   = buildResourceUserPrompt(request);
        return callOpenAI(systemPrompt, userPrompt)
                .map(this::parseResourcesResponse);
    }

    private String buildResourceSystemPrompt() {
        return """
            You are an expert technical interview coach with 10+ years helping
            candidates get hired at top tech companies (FAANG, startups, etc.)
 
            Generate a HIGHLY PERSONALISED resource guide based on the candidate's
            actual performance data and weaknesses.
 
            STRICT URL RULES — only use these known good sources:
            LeetCode:           https://leetcode.com/explore/learn/
            NeetCode roadmap:   https://neetcode.io/roadmap
            NeetCode YouTube:   https://www.youtube.com/@NeetCode
            ByteByteGo YouTube: https://www.youtube.com/@ByteByteGo
            Fireship YouTube:   https://www.youtube.com/@Fireship
            CS Dojo YouTube:    https://www.youtube.com/@CSDojo
            System Design Primer: https://github.com/donnemartin/system-design-primer
            Tech Interview Handbook: https://www.techinterviewhandbook.org/
            Interviewing.io guides: https://interviewing.io/guides/
            GeeksForGeeks DSA:  https://www.geeksforgeeks.org/data-structures/
            CP-Algorithms:      https://cp-algorithms.com/
            MIT OpenCourseWare: https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/
            Martin Fowler patterns: https://martinfowler.com/articles/patterns-of-eaa.html
            High Scalability:   http://highscalability.com/blog/category/example
            AWS Architecture:   https://aws.amazon.com/architecture/
            refactoring.guru:   https://refactoring.guru/design-patterns
            freeCodeCamp:       https://www.freecodecamp.org/learn
            Coursera Algorithms: https://www.coursera.org/specializations/algorithms
            Blind 75 list:      https://leetcode.com/discuss/general-discussion/460599/blind-75-leetcode-questions
            Grind 75:           https://www.techinterviewhandbook.org/grind75
            STAR method guide:  https://www.techinterviewhandbook.org/behavioral-interview/
            Pramp mock interviews: https://www.pramp.com/
            Excalidraw (for diagrams): https://excalidraw.com/
 
            CRITICAL: Do NOT invent or guess URLs. Only use the exact URLs listed above
            or subpages of those domains that clearly exist.
 
            You MUST respond with ONLY valid JSON — no markdown, no code fences,
            no text before or after the JSON.
            """;
    }

//    private String buildResourceUserPrompt(ResourceRequest request) {
//        String cats  = request.getCategories() != null
//                ? String.join(", ", request.getCategories()) : "DSA, SYSTEM_DESIGN, BEHAVIORAL";
//
//        String depth = switch (request.getPrepDepth() != null ? request.getPrepDepth() : "THOROUGH") {
//            case "QUICK"         -> "focused 1-2 week sprint, highest-impact resources only (max 3 sections, 3 resources each)";
//            case "COMPREHENSIVE" -> "in-depth 2-3 month plan, cover everything thoroughly (6 sections, 5+ resources each)";
//            default              -> "solid 4-6 week plan balancing breadth and depth (5 sections, 4-5 resources each)";
//        };
//
//        String level = request.getAvgScore() < 40  ? "BEGINNER (needs fundamentals first)" :
//                request.getAvgScore() < 65  ? "INTERMEDIATE (knows basics, needs patterns and practice)" :
//                        request.getAvgScore() < 80  ? "UPPER-INTERMEDIATE (needs advanced topics + mock interviews)" :
//                                "ADVANCED (needs polish, edge cases, and system design depth)";
//
//        return String.format("""
//            Generate a personalised interview preparation resource guide.
//
//            CANDIDATE DATA:
//            - Categories needed: %s
//            - Weakest category: %s  ← PRIORITISE THIS
//            - Strongest category: %s
//            - Average score: %.1f/100 → Level: %s
//            - Sessions completed: %d
//            - Specific topic requested: %s
//            - Prep depth: %s
//
//            PERSONALISATION RULES:
//            - Score < 40: Start with fundamentals, avoid advanced content
//            - Score 40-65: Focus on pattern recognition and common interview problems
//            - Score 65-80: Focus on hard problems, system design depth, behavioral polish
//            - Score > 80: Focus on mock interviews, rare edge cases, leadership questions
//            - ALWAYS put the weakest category's section first (priority: 1)
//            - Mark isPriority: true for the 2 best resources in each section
//            - whyRecommended must reference the candidate's specific score/weakness
//
//            Respond ONLY with this JSON (no extra text):
//            {
//              "personalizedSummary": "<2-3 sentences about this candidate's profile, their score, and what they need most>",
//              "studyPlan": "<3-phase concrete plan: Phase 1 (week 1-2), Phase 2 (week 3-4), Phase 3 (week 5+) with specific actions>",
//              "estimatedPrepTime": "<realistic estimate e.g. 4-6 weeks>",
//              "quickWins": [
//                "<one concrete action to do TODAY — be specific>",
//                "<one action for THIS WEEK — be specific>",
//                "<one action before the interview — be specific>"
//              ],
//              "sections": [
//                {
//                  "sectionTitle": "<specific topic e.g. 'Dynamic Programming Patterns'>",
//                  "sectionDescription": "<why this section matters for their interviews and their current weakness>",
//                  "priority": <1-5>,
//                  "resources": [
//                    {
//                      "title": "<resource title>",
//                      "description": "<what it covers, what makes it useful for interviews>",
//                      "type": "<ARTICLE|VIDEO|COURSE|BOOK|PRACTICE|DOCUMENTATION|REPO>",
//                      "difficulty": "<BEGINNER|INTERMEDIATE|ADVANCED>",
//                      "estimatedTime": "<e.g. 45 min video, 1 week practice>",
//                      "url": "<exact URL from approved list>",
//                      "platform": "<platform name>",
//                      "topics": ["<specific topic 1>", "<specific topic 2>"],
//                      "whyRecommended": "<1 sentence specific to this candidate's score/weakness>",
//                      "isPriority": <true|false>
//                    }
//                  ]
//                }
//              ]
//            }
//            """,
//                cats,
//                request.getWeakestCategory() != null ? request.getWeakestCategory() : "DSA",
//                request.getStrongestCategory() != null ? request.getStrongestCategory() : "Unknown",
//                request.getAvgScore(),
//                level,
//                request.getTotalSessions(),
//                request.getSpecificTopic() != null ? request.getSpecificTopic() : "none",
//                depth
//        );
//    }

    private String buildResourceUserPrompt(ResourceRequest request) {
        String cats  = request.getCategories() != null
                ? String.join(", ", request.getCategories()) : "DSA, SYSTEM_DESIGN, BEHAVIORAL";

        String depth = switch (request.getPrepDepth() != null ? request.getPrepDepth() : "THOROUGH") {
            case "QUICK"         -> "focused 1-2 week sprint";
            case "COMPREHENSIVE" -> "in-depth 2-3 month plan";
            default              -> "solid 4-6 week plan";
        };

        String level = request.getAvgScore() < 40  ? "BEGINNER" :
                request.getAvgScore() < 65  ? "INTERMEDIATE" :
                        request.getAvgScore() < 80  ? "UPPER-INTERMEDIATE" : "ADVANCED";

        return String.format("""
            Generate a personalised interview preparation resource guide.

            CANDIDATE DATA:
            - Categories needed: %s
            - Weakest category: %s
            - Strongest category: %s
            - Average score: %.1f/100 → Level: %s
            - Sessions completed: %d
            - Specific topic: %s
            - Prep depth: %s

            STRICT SIZE LIMITS — MUST FOLLOW:
            - Maximum 4 sections total
            - Maximum 3 resources per section
            - Keep ALL string values under 150 characters
            - topics array: max 2 items
            - quickWins: exactly 3 items, each under 100 characters

            PERSONALISATION:
            - Score < 40: fundamentals only
            - Score 40-65: patterns and practice
            - Score 65-80: advanced topics + mock interviews
            - Score > 80: edge cases, system design depth, leadership
            - Put weakest category section first (priority: 1)
            - Set isPriority: true for best 1 resource per section only

            Respond ONLY with this JSON (no extra text, no markdown):
            {
              "personalizedSummary": "<2 sentences max>",
              "studyPlan": "<3 phases, 1 sentence each>",
              "estimatedPrepTime": "<e.g. 4-6 weeks>",
              "quickWins": [
                "<action TODAY>",
                "<action THIS WEEK>",
                "<action BEFORE INTERVIEW>"
              ],
              "sections": [
                {
                  "sectionTitle": "<topic>",
                  "sectionDescription": "<1 sentence>",
                  "priority": <1-4>,
                  "resources": [
                    {
                      "title": "<short title>",
                      "description": "<1-2 sentences>",
                      "type": "<ARTICLE|VIDEO|COURSE|BOOK|PRACTICE|DOCUMENTATION|REPO>",
                      "difficulty": "<BEGINNER|INTERMEDIATE|ADVANCED>",
                      "estimatedTime": "<e.g. 30 min>",
                      "url": "<real URL>",
                      "platform": "<platform name>",
                      "topics": ["<topic1>", "<topic2>"],
                      "whyRecommended": "<1 sentence>",
                      "isPriority": <true|false>
                    }
                  ]
                }
              ]
            }
            """,
                cats,
                request.getWeakestCategory()   != null ? request.getWeakestCategory()   : "DSA",
                request.getStrongestCategory() != null ? request.getStrongestCategory() : "Unknown",
                request.getAvgScore(),
                level,
                request.getTotalSessions(),
                request.getSpecificTopic()     != null ? request.getSpecificTopic()     : "none",
                depth
        );
    }

//    private ResourcesResponse parseResourcesResponse(String json) {
//        try {
//            String clean = json.replaceAll("```json", "").replaceAll("```", "").trim();
//            return objectMapper.readValue(clean, ResourcesResponse.class);
//        } catch (Exception e) {
//            log.error("Failed to parse resources JSON: {}\nRaw: {}", e.getMessage(), json);
//            throw new AIResponseException("Failed to parse AI resources response");
//        }
//    }

    private ResourcesResponse parseResourcesResponse(String json) {
        try {
            String clean = json.replaceAll("```json", "").replaceAll("```", "").trim();
            return objectMapper.readValue(clean, ResourcesResponse.class);

        } catch (com.fasterxml.jackson.core.io.JsonEOFException |
                 com.fasterxml.jackson.databind.exc.MismatchedInputException e) {

            // ── Truncated response — try to salvage what was parsed ──
            log.warn("AI response was truncated (hit token limit). Attempting partial parse. Error: {}", e.getMessage());

            try {
                // Try fixing truncation: close any open strings, arrays, objects
                String clean   = json.replaceAll("```json", "").replaceAll("```", "").trim();
                String repaired = repairTruncatedJson(clean);
                return objectMapper.readValue(repaired, ResourcesResponse.class);

            } catch (Exception inner) {
                log.error("Partial parse also failed: {}", inner.getMessage());
                // Return a minimal fallback so frontend doesn't crash
                ResourcesResponse fallback = new ResourcesResponse();
                fallback.setPersonalizedSummary(
                        "Resource generation was interrupted. Please try again or reduce the number of categories.");
                fallback.setStudyPlan("Please regenerate resources.");
                fallback.setEstimatedPrepTime("Unknown");
                fallback.setQuickWins(java.util.List.of(
                        "Try clicking 'Generate Resources' again",
                        "Select fewer categories for a shorter response",
                        "Try 'Quick Prep' depth instead of Comprehensive"
                ));
                fallback.setSections(java.util.List.of());
                return fallback;
            }

        } catch (Exception e) {
            log.error("Failed to parse resources JSON: {}\nRaw: {}", e.getMessage(), json);
            throw new AIResponseException("Failed to parse AI resources response");
        }
    }

    // Best-effort JSON repair for truncated responses
    private String repairTruncatedJson(String json) {
        // Count open braces and brackets to figure out what needs closing
        int openBraces   = 0;
        int openBrackets = 0;
        boolean inString = false;
        boolean escaped  = false;

        for (char c : json.toCharArray()) {
            if (escaped)          { escaped = false; continue; }
            if (c == '\\')        { escaped = true;  continue; }
            if (c == '"')         { inString = !inString; continue; }
            if (inString)         continue;
            if (c == '{')         openBraces++;
            else if (c == '}')    openBraces--;
            else if (c == '[')    openBrackets++;
            else if (c == ']')    openBrackets--;
        }

        StringBuilder sb = new StringBuilder(json);

        // If we're mid-string, close it
        if (inString) sb.append("\"");

        // Close open arrays and objects in reverse order
        // Walk back to find last valid position
        for (int i = 0; i < openBrackets; i++) sb.append("]");
        for (int i = 0; i < openBraces;   i++) sb.append("}");

        return sb.toString();
    }
}
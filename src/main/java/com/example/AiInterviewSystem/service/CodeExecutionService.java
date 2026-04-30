package com.example.AiInterviewSystem.service;

import com.example.AiInterviewSystem.dto.CodeExecutionRequest;
import com.example.AiInterviewSystem.dto.CodeExecutionResult;
import com.example.AiInterviewSystem.dto.TestCaseResult;
import com.example.AiInterviewSystem.exceptions.ResourceNotFoundException;
import com.example.AiInterviewSystem.model.CodeSubmission;
import com.example.AiInterviewSystem.model.CodingChallenge;
import com.example.AiInterviewSystem.model.User;
import com.example.AiInterviewSystem.repository.CodeSubmissionRepository;
import com.example.AiInterviewSystem.repository.CodingChallengeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.reactive.function.client.WebClient;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class CodeExecutionService {

    private final WebClient                 webClient;
    private final CodingChallengeRepository challengeRepository;
    private final CodeSubmissionRepository  submissionRepository;

    @Value("${judge0.api-url}")
    private String judge0Url;

    @Value("${judge0.api-host}")
    private String judge0Host;

    @Value("${judge0.api-key}")
    private String judge0ApiKey;

    private static final Map<String, Integer> LANGUAGE_IDS = Map.of(
            "javascript", 63,
            "python",     71,
            "java",       62,
            "cpp",        54,
            "go",         60,
            "typescript", 74,
            "kotlin",     78,
            "rust",       73
    );

    // ─── Run code against single custom input ────────────────────────────────

    public CodeExecutionResult runCode(CodeExecutionRequest request) {
        // Log to confirm correct values loaded from yml
        log.info("▶ runCode | url={} host={}", judge0Url, judge0Host);

        String token = submitToJudge0(
                request.getSourceCode(),
                request.getLanguage(),
                request.getInput(),
                null
        );

        return pollResult(token);
    }

    // ─── Submit against all hidden test cases ────────────────────────────────

    @Transactional
    public CodeExecutionResult submitCode(CodeExecutionRequest request, User user) {
        log.info("▶ submitCode | url={} host={}", judge0Url, judge0Host);

        CodingChallenge challenge = challengeRepository.findById(request.getChallengeId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Challenge not found: " + request.getChallengeId()));

        @SuppressWarnings("unchecked")
        List<Map<String, String>> testCases =
                (List<Map<String, String>>) challenge.getTestCases();

        List<TestCaseResult> results = new ArrayList<>();
        int passed = 0;

        for (int i = 0; i < testCases.size(); i++) {
            Map<String, String> tc = testCases.get(i);
            String expectedOutput = tc.getOrDefault("expectedOutput", "").trim();

            // Do NOT pass expectedOutput to Judge0 — Judge0 does exact byte comparison
            // which fails on whitespace/newline differences. We compare stdout ourselves.
            String token = submitToJudge0(
                    request.getSourceCode(),
                    request.getLanguage(),
                    tc.get("input"),
                    null
            );
            CodeExecutionResult result = pollResult(token);

            String actualOutput   = result.getStdout()        != null ? result.getStdout().trim()        : "";
            String caseStderr     = result.getStderr()        != null ? result.getStderr().trim()         : null;
            String caseCompile    = result.getCompileOutput() != null ? result.getCompileOutput().trim()  : null;

            // Determine per-case outcome
            boolean outputMatch = actualOutput.equals(expectedOutput);

            String errorStatus;
            boolean isAccepted;
            if (caseCompile != null && !caseCompile.isBlank()) {
                errorStatus = "Compilation Error";
                isAccepted  = false;
            } else if (caseStderr != null && !caseStderr.isBlank()) {
                errorStatus = "Runtime Error";
                isAccepted  = false;
            } else if (outputMatch) {
                errorStatus = "Accepted";
                isAccepted  = true;
            } else {
                errorStatus = "Wrong Answer";
                isAccepted  = false;
            }

            if (isAccepted) passed++;

            results.add(TestCaseResult.builder()
                    .testCaseIndex(i + 1)
                    .passed(isAccepted)
                    .errorStatus(errorStatus)
                    .input(tc.get("input"))
                    .expectedOutput(expectedOutput)
                    .actualOutput(actualOutput)
                    .stderr(caseStderr)
                    .compileOutput(caseCompile)
                    .runtimeMs(result.getRuntimeMs())
                    .build());
        }

        String overallStatus = passed == testCases.size() ? "Accepted" : "Wrong Answer";

        // Only persist the submission when all test cases pass
        if ("Accepted".equals(overallStatus)) {
            CodeSubmission submission = CodeSubmission.builder()
                    .challenge(challenge)
                    .user(user)
                    .language(request.getLanguage())
                    .sourceCode(request.getSourceCode())
                    .status(overallStatus)
                    .testResults(results)
                    .submittedAt(LocalDateTime.now())
                    .build();
            submissionRepository.save(submission);
            log.info("✅ Solution saved for challenge {}", request.getChallengeId());
        } else {
            log.info("⚠ Not saving — {}/{} passed", passed, testCases.size());
        }

        log.info("Submission complete: {}/{} passed — {}", passed, testCases.size(), overallStatus);

        return CodeExecutionResult.builder()
                .status(overallStatus)
                .testCaseResults(results)
                .passedTests(passed)
                .totalTests(testCases.size())
                .build();
    }

    // ─── POST /submissions ───────────────────────────────────────────────────
    // Matches exactly:
    // curl --request POST
    //   --url 'https://judge029.p.rapidapi.com/submissions?base64_encoded=true&wait=false&fields=*'
    //   --header 'x-rapidapi-key: YOUR_KEY'
    //   --header 'x-rapidapi-host: judge029.p.rapidapi.com'
    //   --header 'Content-Type: application/json'

    @SuppressWarnings("unchecked")
    private String submitToJudge0(String sourceCode,
                                  String language,
                                  String stdin,
                                  String expectedOutput) {

        int languageId = LANGUAGE_IDS.getOrDefault(language.toLowerCase(), 71);

        // Build body — all text fields base64 encoded
        Map<String, Object> body = new HashMap<>();
        body.put("source_code", encodeBase64(sourceCode));
        body.put("language_id", languageId);
        body.put("stdin",       encodeBase64(stdin != null ? stdin : ""));
        if (expectedOutput != null) {
            body.put("expected_output", encodeBase64(expectedOutput));
        }

        log.debug("POST /submissions | lang={} langId={} host={}", language, languageId, judge0Host);

        Map<String, Object> response = webClient.post()
                .uri(judge0Url + "/submissions?base64_encoded=true&wait=false&fields=*")
                .header("x-rapidapi-key",  judge0ApiKey)   // lowercase — matches curl
                .header("x-rapidapi-host", judge0Host)      // lowercase — matches curl
                .header("Content-Type",    "application/json")
                .bodyValue(body)
                .retrieve()
                .bodyToMono(Map.class)
                .doOnError(e -> log.error("POST /submissions failed: {}", e.getMessage()))
                .block();

        if (response == null || !response.containsKey("token")) {
            throw new RuntimeException("Judge0 did not return a submission token. Response: " + response);
        }

        String token = (String) response.get("token");
        log.info("✅ Submission token received: {}", token);
        return token;
    }

    // ─── GET /submissions/{token} ────────────────────────────────────────────
    // Matches exactly:
    // curl --request GET
    //   --url 'https://judge029.p.rapidapi.com/submissions/{token}?base64_encoded=true&fields=*'
    //   --header 'x-rapidapi-key: YOUR_KEY'
    //   --header 'x-rapidapi-host: judge029.p.rapidapi.com'

    @SuppressWarnings("unchecked")
    private CodeExecutionResult pollResult(String token) {
        int maxAttempts = 12;

        for (int attempt = 0; attempt < maxAttempts; attempt++) {
            try {
                long sleepMs = attempt < 3 ? 1000L : 2000L;
                log.debug("Polling attempt {} (sleep {}ms) for token {}", attempt + 1, sleepMs, token);
                Thread.sleep(sleepMs);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                break;
            }

            Map<String, Object> result = webClient.get()
                    // Matches exactly:
                    // GET https://judge029.p.rapidapi.com/submissions/{token}?base64_encoded=true&fields=*
                    // x-rapidapi-key, x-rapidapi-host, Content-Type — all three required
                    .uri(judge0Url + "/submissions/" + token + "?base64_encoded=true&fields=*")
                    .header("x-rapidapi-key",  judge0ApiKey)
                    .header("x-rapidapi-host", judge0Host)
                    .header("Content-Type",    "application/json")   // ← ADDED — matches RapidAPI snippet
                    .retrieve()
                    .bodyToMono(Map.class)
                    .doOnError(e -> log.error("GET /submissions/{} failed: {}", token, e.getMessage()))
                    .block();

            if (result == null) {
                log.warn("Null response on poll attempt {}", attempt + 1);
                continue;
            }

            Map<String, Object> status = (Map<String, Object>) result.get("status");
            if (status == null) {
                log.warn("No status field in poll response: {}", result);
                continue;
            }

            int statusId = (int) status.get("id");
            log.debug("Poll {}: status='{}' id={}", attempt + 1, status.get("description"), statusId);

            // statusId >= 3 means processing is finished
            // 3=Accepted, 4=WrongAnswer, 5=TLE, 6=CompilationError, etc.
            if (statusId >= 3) {
                log.info("✅ Execution finished: status='{}' token={}", status.get("description"), token);
                return mapToResult(result, status);
            }
        }

        throw new RuntimeException(
                "Code execution timed out after " + maxAttempts + " poll attempts for token: " + token);
    }

    // ─── Map response to DTO + decode base64 ─────────────────────────────────

    @SuppressWarnings("unchecked")
    private CodeExecutionResult mapToResult(Map<String, Object> result,
                                            Map<String, Object> status) {
        Integer runtimeMs = null;
        if (result.get("time") != null) {
            runtimeMs = (int) (Double.parseDouble(result.get("time").toString()) * 1000);
        }

        Integer memoryKb = null;
        if (result.get("memory") != null) {
            memoryKb = (Integer) result.get("memory");
        }

        int statusId = (int) status.get("id");
        String statusLabel = normalizeStatus(statusId, (String) status.get("description"));

        return CodeExecutionResult.builder()
                .status(       statusLabel)
                .stdout(       decodeBase64((String) result.get("stdout")))
                .stderr(       decodeBase64((String) result.get("stderr")))
                .compileOutput(decodeBase64((String) result.get("compile_output")))
                .runtimeMs(runtimeMs)
                .memoryKb(memoryKb)
                .build();
    }

    /**
     * Map Judge0 numeric status IDs to clean, human-readable labels.
     * Judge0 returns descriptions like "Runtime Error (NZEC)" or "Runtime Error (SIGSEGV)"
     * which look like error codes to users. We normalize them to plain English.
     */
    private static String normalizeStatus(int id, String raw) {
        return switch (id) {
            case 3  -> "Accepted";
            case 4  -> "Wrong Answer";
            case 5  -> "Time Limit Exceeded";
            case 6  -> "Compilation Error";
            case 7  -> "Runtime Error (Memory Limit)";
            case 8  -> "Runtime Error (Output Limit)";
            case 9  -> "Runtime Error (Timeout)";
            case 10 -> "Runtime Error (Illegal System Call)";
            case 11 -> "Runtime Error";        // NZEC — non-zero exit code
            case 12 -> "Runtime Error";        // internal error
            case 13 -> "Runtime Error (Exec)"; // exec format error
            default -> (raw != null && !raw.isBlank()) ? raw : "Unknown Error";
        };
    }

    // ─── Base64 helpers ───────────────────────────────────────────────────────

    private String encodeBase64(String value) {
        if (value == null) return "";
        return Base64.getEncoder()
                .encodeToString(value.getBytes(StandardCharsets.UTF_8));
    }

    private String decodeBase64(String value) {
        if (value == null || value.isBlank()) return null;
        try {
            return new String(
                    Base64.getDecoder().decode(value.trim()),
                    StandardCharsets.UTF_8
            ).trim();
        } catch (IllegalArgumentException e) {
            log.warn("Value was not base64, returning raw: {}", value);
            return value.trim();
        }
    }
}
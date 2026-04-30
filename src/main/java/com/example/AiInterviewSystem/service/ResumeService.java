package com.example.AiInterviewSystem.service;
 
import com.example.AiInterviewSystem.dto.CreateSessionRequest;
import com.example.AiInterviewSystem.dto.ResumeProfile;
import com.example.AiInterviewSystem.enums.Difficulty;
import com.example.AiInterviewSystem.enums.SessionType;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
 
import java.io.IOException;
import java.util.List;
 
@Service
@RequiredArgsConstructor
@Slf4j
public class ResumeService {
 
    private final AIOrchestrationService aiService;
    private final ObjectMapper           objectMapper;
 
    // ─── Parse uploaded resume → structured profile ──────────────────────────
 
    public ResumeProfile parseResume(MultipartFile file) throws IOException {
        log.info("Parsing resume: {}", file.getOriginalFilename());
 
        String text = extractText(file);
        if (text.isBlank()) {
            throw new IllegalArgumentException("Could not extract text from resume. Ensure it is not a scanned image.");
        }
 
        String json = aiService.parseResume(text).block();
        if (json == null || json.isBlank()) {
            throw new RuntimeException("AI returned empty response for resume parsing");
        }
 
        // Strip markdown code fences if the model adds them
        String clean = json.replaceAll("```json", "").replaceAll("```", "").trim();
 
        try {
            return objectMapper.readValue(clean, ResumeProfile.class);
        } catch (Exception e) {
            log.error("Failed to parse resume JSON: {}", e.getMessage());
            throw new RuntimeException("Failed to parse resume profile from AI response");
        }
    }
 
    // ─── Use parsed profile to build a personalised session request ──────────
 
    public CreateSessionRequest buildPersonalisedSession(
            ResumeProfile profile,
            SessionType sessionType) {
 
        Difficulty difficulty = mapExperienceToDifficulty(profile.getExperienceYears());
 
        // Pick the most relevant topic from resume focus areas
        String primaryTopic = profile.getFocusAreas() != null && !profile.getFocusAreas().isEmpty()
                ? profile.getFocusAreas().get(0)
                : "general";
 
        String context = String.format(
                "Candidate has %d years of experience. Tech stack: %s. " +
                "Roles: %s. Focus areas: %s.",
                profile.getExperienceYears(),
                String.join(", ", orEmpty(profile.getTechStack())),
                String.join(", ", orEmpty(profile.getRoles())),
                String.join(", ", orEmpty(profile.getFocusAreas()))
        );

        CreateSessionRequest request = new CreateSessionRequest();
        request.setSessionType(sessionType);
        request.setDifficulty(difficulty);
        request.setTopic(primaryTopic);
        request.setTopics(profile.getFocusAreas());
        request.setContext(context);
        return request;
    }
 
    // ─── Extract plain text from PDF or plain-text files ────────────────────
 
    private String extractText(MultipartFile file) throws IOException {
        String contentType = file.getContentType();
        if (contentType == null) contentType = "";
 
        if (contentType.equals("application/pdf") ||
            file.getOriginalFilename() != null &&
            file.getOriginalFilename().toLowerCase().endsWith(".pdf")) {

            try (PDDocument document = Loader.loadPDF(file.getBytes())) {
                PDFTextStripper stripper = new PDFTextStripper();
                return stripper.getText(document);
            }
        }
 
        // Fallback: treat as plain text (txt, doc, etc.)
        return new String(file.getBytes());
    }
 
    private Difficulty mapExperienceToDifficulty(int years) {
        if (years <= 1) return Difficulty.EASY;
        if (years <= 4) return Difficulty.MEDIUM;
        return Difficulty.HARD;
    }
 
    private List<String> orEmpty(List<String> list) {
        return list != null ? list : List.of();
    }
}
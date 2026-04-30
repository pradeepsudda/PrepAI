package com.example.AiInterviewSystem.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
 
import java.util.List;
 
@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class ResumeProfile {
 
    @JsonProperty("skills")
    private List<String> skills;
 
    @JsonProperty("experienceYears")
    private int experienceYears;
 
    // "JUNIOR" | "MID" | "SENIOR" | "STAFF" | "PRINCIPAL"
    @JsonProperty("seniorityLevel")
    private String seniorityLevel;
 
    @JsonProperty("companies")
    private List<String> companies;
 
    @JsonProperty("roles")
    private List<String> roles;
 
    @JsonProperty("techStack")
    private List<String> techStack;
 
    @JsonProperty("focusAreas")
    private List<String> focusAreas;
}
package com.example.AiInterviewSystem.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import java.util.List;
 
@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class ResourcesResponse {
 
    @JsonProperty("personalizedSummary")
    private String personalizedSummary;
 
    @JsonProperty("studyPlan")
    private String studyPlan;
 
    @JsonProperty("estimatedPrepTime")
    private String estimatedPrepTime;
 
    @JsonProperty("sections")
    private List<ResourceSection> sections;
 
    @JsonProperty("quickWins")
    private List<String> quickWins;
}
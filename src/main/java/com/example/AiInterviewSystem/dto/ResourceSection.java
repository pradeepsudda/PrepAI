package com.example.AiInterviewSystem.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import java.util.List;
 
@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class ResourceSection {
 
    @JsonProperty("sectionTitle")
    private String sectionTitle;
 
    @JsonProperty("sectionDescription")
    private String sectionDescription;
 
    // 1 = most urgent, 5 = optional enrichment
    @JsonProperty("priority")
    private int priority;
 
    @JsonProperty("resources")
    private List<ResourceItem> resources;
}
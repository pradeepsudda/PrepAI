package com.example.AiInterviewSystem.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import java.util.List;
 
@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class ResourceItem {
 
    @JsonProperty("title")
    private String title;
 
    @JsonProperty("description")
    private String description;
 
    // ARTICLE | VIDEO | COURSE | BOOK | PRACTICE | DOCUMENTATION | REPO
    @JsonProperty("type")
    private String type;
 
    // BEGINNER | INTERMEDIATE | ADVANCED
    @JsonProperty("difficulty")
    private String difficulty;
 
    // e.g. "20 min read", "2 hour course"
    @JsonProperty("estimatedTime")
    private String estimatedTime;
 
    @JsonProperty("url")
    private String url;
 
    // e.g. "YouTube", "LeetCode", "GeeksForGeeks"
    @JsonProperty("platform")
    private String platform;
 
    @JsonProperty("topics")
    private List<String> topics;
 
    // Why AI recommends this specifically for this user
    @JsonProperty("whyRecommended")
    private String whyRecommended;
 
    // true = top priority for this user's weakness
    @JsonProperty("isPriority")
    private boolean isPriority;
}
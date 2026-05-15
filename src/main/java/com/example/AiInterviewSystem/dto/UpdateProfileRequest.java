package com.example.AiInterviewSystem.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.Data;
 
@Data
public class UpdateProfileRequest {
 
    @Size(min = 2, max = 100, message = "Name must be 2-100 characters")
    private String fullName;
 
    @Email(message = "Invalid email format")
    private String email;
 
    @Size(max = 300, message = "Bio must be under 300 characters")
    private String bio;
 
    @Size(max = 100, message = "Location must be under 100 characters")
    private String location;
 
    // Platform links — null means "don't change"
    private String githubUrl;
    private String linkedinUrl;
    private String leetcodeUrl;
    private String hackerrankUrl;
    private String codeforcesUrl;
    private String websiteUrl;
 
    // Preferences
    private String  defaultDifficulty;
    private String  preferredLanguage;
    private Boolean emailNotifications;
}
package com.example.AiInterviewSystem.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
 
@Data
public class UpdateProfileRequest {
 
    @Size(min = 2, max = 100, message = "Full name must be between 2 and 100 characters")
    private String fullName;
}
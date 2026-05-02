package com.example.AiInterviewSystem.dto;

import lombok.Data;
 
@Data
public class CodeChangeEvent {
    private String code;
    private String language;
    private String updatedBy;  // set server-side from principal.getName()
}
 
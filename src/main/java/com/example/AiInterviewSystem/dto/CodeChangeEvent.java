package com.example.AiInterviewSystem.dto;

import lombok.Data;
 
@Data
public class CodeChangeEvent {
    private String code;        // full editor content
    private String language;    // current language selection
    private String updatedBy;   // set server-side from Principal
}
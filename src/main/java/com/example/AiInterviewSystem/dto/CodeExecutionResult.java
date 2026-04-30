package com.example.AiInterviewSystem.dto;

import lombok.*;

import java.util.List;
 
@Data
@Builder
public class CodeExecutionResult {
 
    // Overall: "Accepted", "Wrong Answer", "Runtime Error",
    //          "Time Limit Exceeded", "Compilation Error"
    private String status;
 
    private String  stdout;
    private String  stderr;
    private String  compileOutput;
    private Integer runtimeMs;
    private Integer memoryKb;
 
    // Only populated on /submit (hidden test cases)
    private int                passedTests;
    private int                totalTests;
    private List<TestCaseResult> testCaseResults;
}
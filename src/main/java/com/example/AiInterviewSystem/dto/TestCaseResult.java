package com.example.AiInterviewSystem.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Builder;
import lombok.Data;
 
@Data
@Builder
@JsonIgnoreProperties(ignoreUnknown = true)
public class TestCaseResult {

    private int     testCaseIndex;
    private boolean passed;

    /** Human-readable outcome: "Accepted", "Wrong Answer", "Runtime Error", "Compilation Error" */
    private String  errorStatus;

    private String  input;
    private String  expectedOutput;
    private String  actualOutput;

    /** stderr from the execution (runtime exception messages, stack traces) */
    private String  stderr;

    /** compile_output from Judge0 (compilation errors) */
    private String  compileOutput;

    private Integer runtimeMs;
}
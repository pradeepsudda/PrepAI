package com.example.AiInterviewSystem.exceptions;

public class AIParsingException extends RuntimeException {

    public AIParsingException(String message) {
        super(message);
    }

    public AIParsingException(String message, Throwable cause) {
        super(message, cause);
    }
}
package com.example.AiInterviewSystem.exceptions;

public class SessionCompletedException extends RuntimeException {
    public SessionCompletedException(String message) {
        super(message);
    }
}
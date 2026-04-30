package com.example.AiInterviewSystem.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
 
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
 
@Entity
@Table(name = "interview_rooms")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InterviewRoom {
 
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
 
    // UUID of the user who created the room
    @Column(name = "host_id", nullable = false)
    private UUID hostId;
 
    @Column(name = "room_code", nullable = false, unique = true, length = 10)
    private String roomCode;
 
    @Column(nullable = false)
    @Builder.Default
    private boolean active = true;
 
    // Stores participant email addresses
    // Maps to PostgreSQL TEXT[] column
    @Column(name = "participants", columnDefinition = "TEXT[]")
    @Builder.Default
    private List<String> participants = new ArrayList<>();
 
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
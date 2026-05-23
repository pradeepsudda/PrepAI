package com.example.AiInterviewSystem.repository;

import com.example.AiInterviewSystem.model.CodeSubmission;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;
 
public interface CodeSubmissionRepository extends JpaRepository<CodeSubmission, UUID> {

}
 
package com.example.AiInterviewSystem.controller;

import com.example.AiInterviewSystem.dto.ResourceRequest;
import com.example.AiInterviewSystem.dto.ResourcesResponse;
import com.example.AiInterviewSystem.model.User;
import com.example.AiInterviewSystem.service.ResourceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/resources")
@RequiredArgsConstructor
public class ResourceController {

    private final ResourceService resourceService;

    @PostMapping("/generate")
    public ResponseEntity<ResourcesResponse> generateResources(
            @RequestBody ResourceRequest request,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(resourceService.generateResources(request, user));
    }

    @GetMapping
    public ResponseEntity<ResourcesResponse> getResources(
            @RequestParam(required = false) String depth,
            @RequestParam(required = false) String topic,
            @AuthenticationPrincipal User user) {

        ResourceRequest request = new ResourceRequest();
        request.setCategories(List.of("DSA", "SYSTEM_DESIGN", "BEHAVIORAL", "MIXED"));
        request.setPrepDepth(depth != null ? depth : "THOROUGH");
        request.setSpecificTopic(topic);

        return ResponseEntity.ok(resourceService.generateResources(request, user));
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<ResourcesResponse> getByCategory(
            @PathVariable String category,
            @RequestParam(required = false) String depth,
            @AuthenticationPrincipal User user) {

        ResourceRequest request = new ResourceRequest();
        request.setCategories(List.of(category.toUpperCase()));
        request.setPrepDepth(depth != null ? depth : "THOROUGH");

        return ResponseEntity.ok(resourceService.generateResources(request, user));
    }

    @DeleteMapping("/cache")
    public ResponseEntity<Void> clearCache(@AuthenticationPrincipal User user) {
        resourceService.invalidateCache(user);
        return ResponseEntity.noContent().build();
    }
}
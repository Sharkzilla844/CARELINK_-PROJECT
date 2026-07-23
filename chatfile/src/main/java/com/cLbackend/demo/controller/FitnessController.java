package com.cLbackend.demo.controller;
import com.cLbackend.demo.service.FitnessService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/fitness")
public class FitnessController {

    @Autowired
    private FitnessService fitnessService;

    @GetMapping("/recommendations/{patientId}")
    public ResponseEntity<Map<String, Object>> getFitnessPlan(@PathVariable Long patientId) {
        return ResponseEntity.ok(fitnessService.getPersonalizedFitnessPlan(patientId));
    }

    @PostMapping("/toggle-exercise/{patientId}")
    public ResponseEntity<Map<String, Object>> toggleExercise(
            @PathVariable Long patientId,
            @RequestBody Map<String, Object> body) {
        String title = (String) body.get("title");
        Integer duration = body.get("duration") != null ? Integer.parseInt(body.get("duration").toString().replaceAll("[^0-9]", "")) : 20;
        Integer calories = body.get("calories") != null ? Integer.parseInt(body.get("calories").toString().replaceAll("[^0-9]", "")) : 120;
        
        Map<String, Object> updatedProgress = fitnessService.toggleExerciseCompletion(patientId, title, duration, calories);
        return ResponseEntity.ok(updatedProgress);
    }

    @GetMapping("/mental-health/recommendations/{patientId}")
    public ResponseEntity<Map<String, String>> getMentalHealthAdvice(
            @PathVariable Long patientId,
            @RequestParam(required = false, defaultValue = "Okay") String mood,
            @RequestParam(required = false) String tool) {
        String advice = fitnessService.getPersonalizedMentalHealthAdvice(patientId, mood, tool);
        return ResponseEntity.ok(Map.of("advice", advice));
    }
}


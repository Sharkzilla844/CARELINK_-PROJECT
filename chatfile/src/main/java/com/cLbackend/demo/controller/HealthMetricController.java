package com.cLbackend.demo.controller;

import com.cLbackend.demo.entity.HealthMetric;
import com.cLbackend.demo.service.HealthMetricService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/health-metrics")
public class HealthMetricController {

    @Autowired
    private HealthMetricService healthMetricService;

    @GetMapping("/patient/{patientId}/today")
    public ResponseEntity<HealthMetric> getTodayMetrics(@PathVariable Long patientId) {
        HealthMetric metric = healthMetricService.getTodayMetrics(patientId);
        return ResponseEntity.ok(metric);
    }

    @PostMapping("/patient/{patientId}")
    public ResponseEntity<HealthMetric> updateMetrics(
            @PathVariable Long patientId,
            @RequestBody Map<String, Object> payload) {
        
        Integer steps = payload.get("steps") != null ? ((Number) payload.get("steps")).intValue() : null;
        Integer heartRate = payload.get("heartRate") != null ? ((Number) payload.get("heartRate")).intValue() : null;
        Double weight = payload.get("weight") != null ? ((Number) payload.get("weight")).doubleValue() : null;
        Integer sleepQuality = payload.get("sleepQuality") != null ? ((Number) payload.get("sleepQuality")).intValue() : null;

        HealthMetric metric = healthMetricService.updateMetrics(patientId, steps, heartRate, weight, sleepQuality);
        return ResponseEntity.ok(metric);
    }
}

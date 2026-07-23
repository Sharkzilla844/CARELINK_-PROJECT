package com.cLbackend.demo.service;

import com.cLbackend.demo.entity.HealthMetric;
import com.cLbackend.demo.repository.HealthMetricRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Optional;

@Service
public class HealthMetricService {

    @Autowired
    private HealthMetricRepo healthMetricRepo;

    public HealthMetric getTodayMetrics(Long patientId) {
        LocalDate today = LocalDate.now();
        Optional<HealthMetric> existing = healthMetricRepo.findByPatientIdAndRecordDate(patientId, today);
        
        // If no metrics for today, create an empty one
        if (existing.isPresent()) {
            return existing.get();
        } else {
            HealthMetric newMetric = new HealthMetric(patientId, 0, 0, 0.0, 0, today);
            return healthMetricRepo.save(newMetric);
        }
    }

    public HealthMetric updateMetrics(Long patientId, Integer steps, Integer heartRate, Double weight, Integer sleepQuality) {
        LocalDate today = LocalDate.now();
        Optional<HealthMetric> existing = healthMetricRepo.findByPatientIdAndRecordDate(patientId, today);

        HealthMetric metric;
        if (existing.isPresent()) {
            metric = existing.get();
        } else {
            metric = new HealthMetric(patientId, 0, 0, 0.0, 0, today);
        }

        if (steps != null) {
            metric.setSteps(steps);
        }
        if (heartRate != null) {
            metric.setHeartRate(heartRate);
        }
        if (weight != null) {
            metric.setWeight(weight);
        }
        if (sleepQuality != null) {
            metric.setSleepQuality(sleepQuality);
        }

        return healthMetricRepo.save(metric);
    }
}

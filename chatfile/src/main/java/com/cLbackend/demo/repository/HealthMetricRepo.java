package com.cLbackend.demo.repository;

import com.cLbackend.demo.entity.HealthMetric;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;

@Repository
public interface HealthMetricRepo extends JpaRepository<HealthMetric, Long> {
    Optional<HealthMetric> findByPatientIdAndRecordDate(Long patientId, LocalDate recordDate);
}

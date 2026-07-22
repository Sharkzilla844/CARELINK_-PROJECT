package com.cLbackend.demo.repository;

import com.cLbackend.demo.entity.FitnessActivity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface FitnessActivityRepo extends JpaRepository<FitnessActivity, Long> {
    List<FitnessActivity> findByPatientId(Long patientId);
    List<FitnessActivity> findByPatientIdAndActivityDate(Long patientId, LocalDate activityDate);
    void deleteByPatientIdAndExerciseTitle(Long patientId, String exerciseTitle);
}

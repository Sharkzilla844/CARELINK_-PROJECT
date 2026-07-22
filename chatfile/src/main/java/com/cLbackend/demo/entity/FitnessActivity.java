package com.cLbackend.demo.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "fitness_activities")
public class FitnessActivity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long patientId;

    private String exerciseTitle;

    private Integer durationMinutes;

    private Integer caloriesBurned;

    private String dayOfWeek;

    private LocalDate activityDate;

    public FitnessActivity() {
    }

    public FitnessActivity(Long patientId, String exerciseTitle, Integer durationMinutes, Integer caloriesBurned, String dayOfWeek, LocalDate activityDate) {
        this.patientId = patientId;
        this.exerciseTitle = exerciseTitle;
        this.durationMinutes = durationMinutes;
        this.caloriesBurned = caloriesBurned;
        this.dayOfWeek = dayOfWeek;
        this.activityDate = activityDate;
    }

    public Long getId() {
        return id;
    }

    public Long getPatientId() {
        return patientId;
    }

    public void setPatientId(Long patientId) {
        this.patientId = patientId;
    }

    public String getExerciseTitle() {
        return exerciseTitle;
    }

    public void setExerciseTitle(String exerciseTitle) {
        this.exerciseTitle = exerciseTitle;
    }

    public Integer getDurationMinutes() {
        return durationMinutes;
    }

    public void setDurationMinutes(Integer durationMinutes) {
        this.durationMinutes = durationMinutes;
    }

    public Integer getCaloriesBurned() {
        return caloriesBurned;
    }

    public void setCaloriesBurned(Integer caloriesBurned) {
        this.caloriesBurned = caloriesBurned;
    }

    public String getDayOfWeek() {
        return dayOfWeek;
    }

    public void setDayOfWeek(String dayOfWeek) {
        this.dayOfWeek = dayOfWeek;
    }

    public LocalDate getActivityDate() {
        return activityDate;
    }

    public void setActivityDate(LocalDate activityDate) {
        this.activityDate = activityDate;
    }
}

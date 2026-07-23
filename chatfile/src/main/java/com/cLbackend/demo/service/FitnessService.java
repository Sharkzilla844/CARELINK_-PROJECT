package com.cLbackend.demo.service;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
public class FitnessService {

    @Autowired
    private com.cLbackend.demo.repository.FitnessActivityRepo fitnessActivityRepo;

    @Value("${nutrition.service.url:http://localhost:8084}")
    private String nutritionServiceUrl;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @org.springframework.beans.factory.annotation.Value("${gemini.api.key}")
    private String GEMINI_API_KEY;

    public Map<String, Object> getPersonalizedFitnessPlan(Long patientId) {
        List<String> allergies = new ArrayList<>();
        try {
            List<Map> allergyList = restTemplate.getForObject(nutritionServiceUrl + "/api/allergies/patient/" + patientId, List.class);
            if (allergyList != null) {
                for (Map a : allergyList) {
                    if (a.containsKey("allergen")) {
                        allergies.add((String) a.get("allergen"));
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("Failed to fetch allergies from nutrition service: " + e.getMessage());
        }

        List<String> conditions = new ArrayList<>();
        List<String> medications = new ArrayList<>();
        try {
            List<Map> prescriptionList = restTemplate.getForObject(nutritionServiceUrl + "/api/prescriptions/patient/" + patientId, List.class);
            if (prescriptionList != null) {
                for (Map p : prescriptionList) {
                    String illness = (String) p.get("illness");
                    if (illness != null && !illness.isEmpty() && !conditions.contains(illness)) {
                        conditions.add(illness);
                    }
                    List<String> meds = (List<String>) p.get("medications");
                    if (meds != null) {
                        for (String med : meds) {
                            if (!medications.contains(med)) {
                                medications.add(med);
                            }
                        }
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("Failed to fetch prescriptions from nutrition service: " + e.getMessage());
        }

        // Ensure there's at least a fallback if empty
        if (conditions.isEmpty()) conditions.add("None recorded");
        if (medications.isEmpty()) medications.add("None recorded");

        // Call Gemini for safe, personalized exercises
        List<Map<String, Object>> recommendations = generateDailyRecommendations(conditions, allergies);

        Map<String, Object> response = new HashMap<>();
        response.put("healthSummary", buildHealthSummary(conditions, allergies, medications));
        response.put("weeklyProgress", buildWeeklyProgressFromDb(patientId));
        response.put("dailyRecommendations", recommendations);

        return response;
    }

    private List<Map<String, Object>> generateDailyRecommendations(List<String> conditions, List<String> allergies) {
        try {
            // Determine current 2-hour time window
            int hour = java.time.LocalTime.now().getHour();
            int startHour = (hour / 2) * 2;
            int endHour = startHour + 2;
            String timeWindow = String.format("%02d:00 - %02d:00", startHour, endHour);

            String prompt = String.format("""
                You are a personal physical trainer.
                Current Time Window: %s.
                
                Patient Profile:
                - Conditions: %s
                - Allergies: %s
                
                Generate 3 safe, low-impact exercise recommendations specifically tailored for the current 2-hour time window (%s).
                Rules:
                - Must be low-impact and safe for high blood pressure.
                - Vary the exercises based on the time window (e.g. morning = energizing, afternoon = mobility/stamina, evening = gentle stretching/relaxation).
                - Include step-by-step instructions ("instructions"), equipment ("equipment"), and safety precautions ("precautions") for each exercise.
                
                Return ONLY a valid JSON array with this exact structure:
                [
                  {
                    "title": "Brisk Morning Walk",
                    "duration": "25 min",
                    "calories": "140 cal",
                    "level": "Beginner",
                    "impact": "Low Impact",
                    "timeWindow": "%s",
                    "why": "Low impact for joint health and blood pressure management",
                    "benefit": "Improves cardiovascular circulation without excessive strain",
                    "equipment": "Comfortable walking shoes & water bottle",
                    "instructions": [
                      "Step 1: Stand tall with shoulders relaxed and chin parallel to the ground.",
                      "Step 2: Step forward landing gently on your heel and rolling through to your toes.",
                      "Step 3: Swing your arms naturally at a 90-degree bend to maintain rhythm.",
                      "Step 4: Maintain a steady, brisk pace while breathing smoothly through your nose."
                    ],
                    "precautions": [
                      "Keep hydrated before and after your walk.",
                      "Avoid sudden sprinting or holding your breath.",
                      "Slow down immediately if you feel lightheaded or short of breath."
                    ]
                  }
                ]
                """, timeWindow, String.join(", ", conditions), String.join(", ", allergies), timeWindow, timeWindow);

            String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + GEMINI_API_KEY;

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("contents", List.of(Map.of("parts", List.of(Map.of("text", prompt)))));

            Map<String, Object> response = restTemplate.postForObject(url, requestBody, Map.class);
            String jsonText = extractTextFromGemini(response);

            return objectMapper.readValue(jsonText.replace("```json", "").replace("```", "").trim(), List.class);

        } catch (Exception e) {
            // Safe fallback recommendations
            int hour = java.time.LocalTime.now().getHour();
            int startHour = (hour / 2) * 2;
            String timeWindow = String.format("%02d:00 - %02d:00", startHour, startHour + 2);

            List<Map<String, Object>> fallback = new ArrayList<>();
            Map<String, Object> ex1 = new HashMap<>();
            ex1.put("title", hour < 12 ? "Morning Brisk Walk" : (hour < 18 ? "Afternoon Mobility Walk" : "Evening Relaxation Walk"));
            ex1.put("duration", "25 min");
            ex1.put("calories", "130 cal");
            ex1.put("level", "Beginner");
            ex1.put("impact", "Low Impact");
            ex1.put("timeWindow", timeWindow);
            ex1.put("why", "Low impact for joint health and blood pressure management");
            ex1.put("benefit", "Improves cardiovascular circulation without excessive strain");
            ex1.put("equipment", "Comfortable walking shoes & water bottle");
            ex1.put("instructions", List.of(
                "Step 1: Stand tall with shoulders relaxed and chin parallel to the ground.",
                "Step 2: Step forward landing gently on your heel and rolling through to your toes.",
                "Step 3: Swing your arms naturally at a 90-degree bend to maintain rhythm.",
                "Step 4: Maintain a steady, brisk pace while breathing smoothly through your nose."
            ));
            ex1.put("precautions", List.of(
                "Keep hydrated before and after walking.",
                "Maintain steady nasal breathing.",
                "Stop if you feel dizzy or lightheaded."
            ));
            fallback.add(ex1);

            Map<String, Object> ex2 = new HashMap<>();
            ex2.put("title", hour < 12 ? "Gentle Sun Salutation" : (hour < 18 ? "Postural Alignment Stretch" : "Nighttime Restorative Yoga"));
            ex2.put("duration", "20 min");
            ex2.put("calories", "80 cal");
            ex2.put("level", "Beginner");
            ex2.put("impact", "Low Impact");
            ex2.put("timeWindow", timeWindow);
            ex2.put("why", "Enhances flexibility and reduces stress-induced hypertension");
            ex2.put("benefit", "Promotes relaxation and lowers cortisol levels");
            ex2.put("equipment", "Non-slip yoga mat or soft carpet");
            ex2.put("instructions", List.of(
                "Step 1: Unroll your yoga mat and stand in mountain pose with feet hip-width apart.",
                "Step 2: Inhale deeply as you sweep your arms overhead, reaching gently toward the ceiling.",
                "Step 3: Exhale slowly as you fold forward from your hips, keeping knees slightly soft.",
                "Step 4: Hold each stretch for 3 to 5 full breaths, focusing on relaxing your lower back and neck."
            ));
            ex2.put("precautions", List.of(
                "Do not strain or force deep bends.",
                "Inhale smoothly during upward motion, exhale during folds.",
                "Rest in child's pose if you need a break."
            ));
            fallback.add(ex2);

            return fallback;
        }
    }

    private String extractTextFromGemini(Map<String, Object> response) {
        try {
            List<Map<String, Object>> candidates = (List<Map<String, Object>>) response.get("candidates");
            Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
            List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
            return (String) parts.get(0).get("text");
        } catch (Exception e) {
            return "[]";
        }
    }

    private Map<String, Object> buildHealthSummary(List<String> conditions, List<String> allergies, List<String> medications) {
        Map<String, Object> summary = new HashMap<>();
        summary.put("condition", String.join(", ", conditions));
        summary.put("medication", String.join(", ", medications)); 
        summary.put("allergies", allergies.isEmpty() ? "None" : String.join(", ", allergies));
        summary.put("riskLevel", "Assessed based on profile");
        summary.put("updated", new java.text.SimpleDateFormat("hh:mm a").format(new java.util.Date()));
        return summary;
    }

    @org.springframework.transaction.annotation.Transactional
    public Map<String, Object> toggleExerciseCompletion(Long patientId, String title, Integer durationMinutes, Integer caloriesBurned) {
        java.time.LocalDate today = java.time.LocalDate.now();
        String dayOfWeek = today.getDayOfWeek().getDisplayName(java.time.format.TextStyle.SHORT, java.util.Locale.ENGLISH);

        List<com.cLbackend.demo.entity.FitnessActivity> existing = fitnessActivityRepo.findByPatientIdAndActivityDate(patientId, today);
        boolean found = false;
        if (existing != null) {
            for (com.cLbackend.demo.entity.FitnessActivity act : existing) {
                if (act.getExerciseTitle() != null && act.getExerciseTitle().equalsIgnoreCase(title)) {
                    fitnessActivityRepo.delete(act);
                    found = true;
                    break;
                }
            }
        }

        if (!found) {
            com.cLbackend.demo.entity.FitnessActivity act = new com.cLbackend.demo.entity.FitnessActivity(
                patientId, title, durationMinutes != null ? durationMinutes : 20, caloriesBurned != null ? caloriesBurned : 120, dayOfWeek, today
            );
            fitnessActivityRepo.save(act);
        }

        return buildWeeklyProgressFromDb(patientId);
    }

    public Map<String, Object> buildWeeklyProgressFromDb(Long patientId) {
        List<com.cLbackend.demo.entity.FitnessActivity> activities = fitnessActivityRepo.findByPatientId(patientId);
        
        int totalMins = 0;
        int totalKcal = 0;
        Set<String> activeDays = new HashSet<>();
        List<String> completedToday = new ArrayList<>();
        java.time.LocalDate today = java.time.LocalDate.now();

        if (activities != null) {
            for (com.cLbackend.demo.entity.FitnessActivity act : activities) {
                totalMins += (act.getDurationMinutes() != null ? act.getDurationMinutes() : 0);
                totalKcal += (act.getCaloriesBurned() != null ? act.getCaloriesBurned() : 0);
                if (act.getDayOfWeek() != null) {
                    activeDays.add(act.getDayOfWeek());
                }
                if (today.equals(act.getActivityDate()) && act.getExerciseTitle() != null) {
                    completedToday.add(act.getExerciseTitle());
                }
            }
        }

        Map<String, Object> progress = new HashMap<>();
        progress.put("currentMinutes", totalMins);
        progress.put("goalMinutes", 150);
        progress.put("kcalBurned", totalKcal);
        progress.put("streakDays", activeDays.size());
        progress.put("days", List.of("Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"));
        progress.put("activeDays", activeDays);
        progress.put("completedToday", completedToday);
        return progress;
    }

    public String getPersonalizedMentalHealthAdvice(Long patientId, String mood, String tool) {
        List<String> conditions = new ArrayList<>();
        try {
            List<Map> prescriptionList = restTemplate.getForObject(nutritionServiceUrl + "/api/prescriptions/patient/" + patientId, List.class);
            if (prescriptionList != null) {
                for (Map p : prescriptionList) {
                    String illness = (String) p.get("illness");
                    if (illness != null && !illness.isEmpty() && !conditions.contains(illness)) {
                        conditions.add(illness);
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("Failed to fetch prescriptions for mental health advice: " + e.getMessage());
        }

        if (conditions.isEmpty()) conditions.add("None recorded");

        try {
            String prompt;
            if (tool != null && !tool.trim().isEmpty()) {
                prompt = String.format("""
                    You are a compassionate clinical psychologist and mental wellness coach.
                    
                    Patient Profile:
                    - Health Conditions: %s
                    - Current Mood: %s
                    - Selected Support Tool: %s
                    
                    Provide safe, supportive, personalized mental wellness advice specifically for the selected tool.
                    Rules:
                    - Give a warm, practical 2-3 sentence tip for practicing this tool (e.g. if tool is "Gratitude Journal", suggest writing 3 small things; if "Sleep Improvement", give a sleep hygiene tip).
                    - Respect any health conditions (e.g. if they have Hypertension, explain how this tool helps reduce blood pressure).
                    - Keep the tone warm, educational, and supportive.
                    - Do not add any introduction or JSON wrapper. Just return the raw advice.
                    """, String.join(", ", conditions), mood, tool);
            } else {
                prompt = String.format("""
                    You are a compassionate clinical psychologist and mental wellness coach.
                    
                    Patient Profile:
                    - Health Conditions: %s
                    - Current Mood: %s
                    
                    Provide safe, supportive, personalized mental wellness advice.
                    Rules:
                    - Give a short, encouraging response tailored to their mood (e.g. if stressed, recommend slow deep breathing; if low, recommend active appreciation or light movement).
                    - Respect any health conditions they have (e.g. if they have Hypertension, recommend exercises that don't increase heart rate dramatically).
                    - Keep the tone warm, educational, and supportive.
                    - Keep it brief (around 2-3 sentences max).
                    
                    Return ONLY the raw recommendation text, no JSON wrapping, no explanation.
                    """, String.join(", ", conditions), mood);
            }

            String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + GEMINI_API_KEY;

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("contents", List.of(Map.of("parts", List.of(Map.of("text", prompt)))));

            Map<String, Object> response = restTemplate.postForObject(url, requestBody, Map.class);
            String text = extractTextFromGemini(response);
            if ("[]".equals(text) || text == null || text.trim().isEmpty()) {
                return "Take a deep breath and give yourself a moment of rest. Focus on mindful breathing and gentle stretches to help center yourself.";
            }
            return text;
        } catch (Exception e) {
            System.err.println("Failed calling Gemini for mental health: " + e.getMessage());
            return "Take a deep breath and give yourself a moment of rest. Focus on mindful breathing and gentle stretches to help center yourself.";
        }
    }
}


// app/(patient)/analysis.tsx
import React from 'react';
import { View, Text, ScrollView, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import PageHeader from '../../src/components/PageHeader';

export default function AnalysisScreen() {
  const router = useRouter();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F5F7FB' }} edges={['top', 'left', 'right']}>
      <PageHeader title="Food analysis" eyebrow="Safety report" subtitle="Ingredients and nutrition checked against your health profile." onBack={() => router.back()} />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Danger Warning */}
        <View style={styles.warningBox}>
          <Ionicons name="warning" size={22} color="#DC2626" />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={styles.warningTitle}>Danger: Allergen Detected</Text>
            <Text style={styles.warningText}>
              This item contains Peanuts and Soy, which match your critical allergy profile. Consumption is highly discouraged.
            </Text>
          </View>
        </View>

        {/* Food Image */}
        <View style={styles.foodImageContainer}>
          <Image 
            source={{ uri: 'https://picsum.photos/id/292/400/200' }} 
            style={styles.foodImage} 
          />
          <View style={styles.detectedLabel}>
            <Text style={styles.detectedText}>Detected: Chicken Satay Platter</Text>
          </View>
        </View>

        {/* Nutritional Overview */}
        <Text style={styles.sectionTitle}>Nutritional Overview</Text>
        <View style={styles.nutritionRow}>
          <View style={styles.nutritionCard}>
            <Text style={styles.nutritionValue}>450</Text>
            <Text style={styles.nutritionLabel}>Calories</Text>
          </View>
          <View style={styles.nutritionCard}>
            <Text style={styles.nutritionValue}>28g</Text>
            <Text style={styles.nutritionLabel}>Protein</Text>
          </View>
          <View style={styles.nutritionCard}>
            <Text style={styles.nutritionValue}>32g</Text>
            <Text style={styles.nutritionLabel}>Fat</Text>
          </View>
        </View>

        {/* Allergens */}
        <Text style={styles.sectionTitle}>Allergens</Text>
        <View style={styles.allergenContainer}>
          <View style={styles.allergenChipDanger}>
            <Text style={styles.allergenText}>Peanuts</Text>
          </View>
          <View style={styles.allergenChipDanger}>
            <Text style={styles.allergenText}>Soy</Text>
          </View>
          <View style={styles.allergenChipSafe}>
            <Text style={styles.allergenText}>Dairy (Safe)</Text>
          </View>
        </View>

        {/* Ingredient List */}
        <Text style={styles.sectionTitle}>Ingredient List</Text>
        <View style={styles.ingredientList}>
          <View style={styles.ingredientRow}>
            <Text style={styles.ingredientText}>Grilled Chicken Breast</Text>
            <Ionicons name="checkmark-circle" size={20} color="#16A36A" />
          </View>
          <View style={styles.ingredientRow}>
            <Text style={[styles.ingredientText, { color: '#DC2626' }]}>Peanut Paste</Text>
            <Ionicons name="close-circle" size={20} color="#DC2626" />
          </View>
          <View style={styles.ingredientRow}>
            <Text style={styles.ingredientText}>Coconut Milk</Text>
            <Ionicons name="checkmark-circle" size={20} color="#16A36A" />
          </View>
          <View style={styles.ingredientRow}>
            <Text style={[styles.ingredientText, { color: '#DC2626' }]}>Soy Sauce</Text>
            <Ionicons name="close-circle" size={20} color="#DC2626" />
          </View>
        </View>

        {/* Insight Card */}
        <View style={styles.insightBox}>
          <Text style={styles.insightTitle}>CareLink Insight</Text>
          <Text style={styles.insightText}>
            Based on your recent lab results, the high sodium content in this dish might impact your current hypertension management plan.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FB',
    padding: 16,
  },
  content: { paddingBottom: 40 },
  warningBox: {
    backgroundColor: '#FFEBEE',
    padding: 16,
    borderRadius: 22,
    flexDirection: 'row',
    marginBottom: 20,
  },
  warningTitle: {
    color: '#DC2626',
    fontWeight: '700',
    fontSize: 15,
    marginBottom: 4,
  },
  warningText: {
    color: '#991B1B',
    fontSize: 13,
  },
  foodImageContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  foodImage: {
    width: '100%',
    height: 200,
    borderRadius: 22,
  },
  detectedLabel: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  detectedText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#14213D',
    marginBottom: 12,
    marginTop: 10,
  },
  nutritionRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  nutritionCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 22,
    alignItems: 'center',
  },
  nutritionValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2563EB',
  },
  nutritionLabel: {
    fontSize: 13,
    color: '#6F7D93',
    marginTop: 4,
  },
  allergenContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  allergenChipDanger: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  allergenChipSafe: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  allergenText: {
    fontSize: 13,
    fontWeight: '600',
  },
  ingredientList: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  ingredientRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F1',
  },
  ingredientText: {
    fontSize: 15,
    color: '#14213D',
  },
  insightBox: {
    backgroundColor: '#41506A',
    padding: 20,
    borderRadius: 16,
    marginBottom: 40,
  },
  insightTitle: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
    marginBottom: 8,
  },
  insightText: {
    color: '#D1D5DB',
    fontSize: 14,
    lineHeight: 20,
  },
});
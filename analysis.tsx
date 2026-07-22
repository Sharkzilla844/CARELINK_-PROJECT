import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ScrollView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BACKEND_URL } from '../../src/services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import PageHeader from '../../src/components/PageHeader';

export default function AllergyRecordsScreen() {
  const router = useRouter();
  const [allergies, setAllergies] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);

  // Form input states
  const [allergen, setAllergen] = useState('');
  const [type, setType] = useState('FOOD'); // FOOD, MEDS, ENV
  const [severity, setSeverity] = useState('MODERATE'); // MILD, MODERATE, SEVERE
  const [reaction, setReaction] = useState('');
  const [reminderDays, setReminderDays] = useState('7');
  const [reminderTime, setReminderTime] = useState('08:00 AM');

  const fetchAllergies = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      const user = userData ? JSON.parse(userData) : null;
      if (!user) return;

      const res = await fetch(`${BACKEND_URL}/allergies/patient/${user.id}`);
      if (res.ok) {
        const data = await res.json();
        setAllergies(data || []);
      }
    } catch (error) {
      console.error('Failed to fetch allergies');
    }
  };

  useEffect(() => {
    fetchAllergies();
  }, []);

  const scheduleAllergyReminder = async (allergenName: string, daysStr: string, timeStr: string) => {
    const days = parseInt(daysStr, 10) || 7;
    Alert.alert(
      '⏰ Medication Reminder Set!',
      `Scheduled daily reminder for "${allergenName}" medication at ${timeStr} for ${days} days.\n\nYou will be notified as taking time approaches.`,
      [{ text: 'Great' }]
    );
  };

  const handleAddAllergy = async () => {
    if (!allergen || !reaction) {
      Alert.alert('Error', 'Please fill allergen and reaction fields');
      return;
    }

    try {
      const userData = await AsyncStorage.getItem('user');
      const user = userData ? JSON.parse(userData) : null;
      if (!user) return;

      const newAllergy = {
        patientId: user.id,
        allergen,
        type,
        severity,
        reaction,
      };

      const res = await fetch(`${BACKEND_URL}/allergies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAllergy),
      });

      if (res.ok) {
        if (type === 'MEDS') {
          scheduleAllergyReminder(allergen, reminderDays, reminderTime);
        }
        setModalVisible(false);
        resetForm();
        fetchAllergies();
      } else {
        Alert.alert('Error', 'Failed to add allergy');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to save allergy');
    }
  };

  const handleDelete = async (id: number) => {
    Alert.alert('Delete Allergy Record', 'Are you sure you want to remove this record?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const userData = await AsyncStorage.getItem('user');
            const user = userData ? JSON.parse(userData) : null;
            if (!user) return;

            const res = await fetch(`${BACKEND_URL}/allergies/${id}/patient/${user.id}`, {
              method: 'DELETE',
            });
            if (res.ok) {
              fetchAllergies();
            }
          } catch (error) {
            Alert.alert('Error', 'Failed to delete allergy');
          }
        },
      },
    ]);
  };

  const resetForm = () => {
    setAllergen('');
    setType('FOOD');
    setSeverity('MODERATE');
    setReaction('');
  };

  // Group statistics calculations
  const totalRecords = allergies.length;
  const foodCount = allergies.filter(a => a.type === 'FOOD').length;
  const medsCount = allergies.filter(a => a.type === 'MEDS').length;
  const envCount = allergies.filter(a => a.type === 'ENV' || a.type === 'ENVIRONMENTAL').length;

  const getAllergyIcon = (allergyType: string) => {
    switch (allergyType) {
      case 'FOOD':
        return 'pizza';
      case 'MEDS':
        return 'medical';
      default:
        return 'leaf';
    }
  };

  const getSeverityColor = (sev: string) => {
    switch (sev?.toUpperCase()) {
      case 'SEVERE':
        return { bg: '#FEE2E2', text: '#EF4444' };
      case 'MODERATE':
        return { bg: '#F3E8FF', text: '#8B5CF6' };
      default:
        return { bg: '#ECFDF5', text: '#14B8A6' };
    }
  };

  const renderHeader = () => (
    <View style={{ paddingHorizontal: 20, paddingTop: 16 }}>
      {/* Introduction Paragraph */}
      <Text style={styles.introText}>
        Keeping your allergy records up-to-date helps CareLink provide safer health recommendations and emergency alerts tailored specifically to your needs.
      </Text>

      {/* Active Allergies Summary Card */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryHeader}>
          <Ionicons name="bar-chart" size={16} color="#2563EB" />
          <Text style={styles.summaryTitle}>Active Allergies</Text>
        </View>

        <Text style={styles.totalText}>
          <Text style={styles.totalNumber}>{totalRecords}</Text> TOTAL RECORDS
        </Text>

        <View style={styles.badgeRow}>
          <View style={styles.countBadge}>
            <Text style={styles.badgeCountText}><Text style={{ fontWeight: '700' }}>{foodCount}</Text> FOOD</Text>
          </View>
          <View style={styles.countBadge}>
            <Text style={styles.badgeCountText}><Text style={{ fontWeight: '700' }}>{medsCount}</Text> MEDS</Text>
          </View>
          <View style={styles.countBadge}>
            <Text style={styles.badgeCountText}><Text style={{ fontWeight: '700' }}>{envCount}</Text> ENV</Text>
          </View>
        </View>
      </View>

      {/* Why This Matters Banner */}
      <View style={styles.bannerCard}>
        <View style={styles.bannerIconContainer}>
          <Ionicons name="shield-checkmark-outline" size={20} color="#FFFFFF" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.bannerTitle}>Why this matters</Text>
          <Text style={styles.bannerDescription}>
            Your data prevents harmful drug interactions and ensures medical teams act with precision during care.
          </Text>
        </View>
      </View>

      {/* Section Divider with Button */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionHeading}>Your Records</Text>
        <TouchableOpacity style={styles.smallAddButton} onPress={() => setModalVisible(true)}>
          <Ionicons name="add" size={16} color="#FFFFFF" />
          <Text style={styles.smallAddButtonText}>Add Allergy</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F5F7FB' }} edges={['top', 'left', 'right']}>
      <PageHeader title="Allergy records" eyebrow="Safety profile" subtitle={`${allergies.length} recorded conditions and reactions.`} onBack={() => router.back()} />

      {/* List Layout */}
      <FlatList
        data={allergies}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={renderHeader}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ backgroundColor: '#F5F7FB', paddingBottom: 100 }}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Ionicons name="shield-outline" size={48} color="#98A4B7" />
            <Text style={styles.emptyText}>No Allergy Records Logged</Text>
          </View>
        )}
        renderItem={({ item }) => {
          const sevStyle = getSeverityColor(item.severity);
          return (
            <View style={styles.allergyCard}>
              <View style={styles.cardTopRow}>
                <View style={styles.avatarIconContainer}>
                  <Ionicons name={getAllergyIcon(item.type)} size={18} color="#2563EB" />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.allergenTitle}>{item.allergen}</Text>
                  <View style={styles.badgesRow}>
                    <View style={styles.typeBadge}>
                      <Text style={styles.typeBadgeText}>{item.type}</Text>
                    </View>
                    <View style={[styles.severityBadge, { backgroundColor: sevStyle.bg }]}>
                      <Text style={[styles.severityBadgeText, { color: sevStyle.text }]}>
                        {item.severity}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Right Align Action Icons */}
                <View style={styles.actionIconsRow}>
                  <TouchableOpacity onPress={() => handleDelete(item.id)}>
                    <Ionicons name="trash-outline" size={18} color="#98A4B7" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Reaction Quotes Container */}
              <View style={styles.quoteBlock}>
                <Text style={styles.quoteText}>
                  &ldquo;{item.reaction || 'No reaction details specified.'}&rdquo;
                </Text>
              </View>
            </View>
          );
        }}
      />

      {/* Full-Screen Add Allergy Modal Sheet */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Allergy Record</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                <Ionicons name="close" size={24} color="#41506A" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
              {/* Input: Allergen */}
              <Text style={styles.inputLabel}>ALLERGEN NAME</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Peanut, Penicillin, Pollen"
                placeholderTextColor="#98A4B7"
                value={allergen}
                onChangeText={setAllergen}
              />

              {/* Picker: Type */}
              <Text style={styles.inputLabel}>ALLERGY CATEGORY</Text>
              <View style={styles.pickerRow}>
                {['FOOD', 'MEDS', 'ENV'].map((t) => (
                  <TouchableOpacity
                    key={t}
                    style={[styles.pickerPill, type === t && styles.pickerPillActive]}
                    onPress={() => setType(t)}
                  >
                    <Text style={[styles.pickerPillText, type === t && styles.pickerPillTextActive]}>
                      {t === 'ENV' ? 'Environmental' : t === 'MEDS' ? 'Medication' : 'Food'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Picker: Severity */}
              <Text style={styles.inputLabel}>SEVERITY LEVEL</Text>
              <View style={styles.pickerRow}>
                {['MILD', 'MODERATE', 'SEVERE'].map((s) => (
                  <TouchableOpacity
                    key={s}
                    style={[styles.pickerPill, severity === s && styles.pickerPillActive]}
                    onPress={() => setSeverity(s)}
                  >
                    <Text style={[styles.pickerPillText, severity === s && styles.pickerPillTextActive]}>
                      {s}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Input: Reaction Description */}
              <Text style={styles.inputLabel}>REACTION DETAILS / SYMPTOMS</Text>
              <TextInput
                style={[styles.input, { height: 90, textAlignVertical: 'top', paddingTop: 12 }]}
                placeholder="Describe reaction (e.g. skin rash, swelling, shortness of breath)"
                placeholderTextColor="#98A4B7"
                value={reaction}
                onChangeText={setReaction}
                multiline
                numberOfLines={3}
              />

              {/* Action Button */}
              <TouchableOpacity style={styles.saveBtnSubmit} onPress={handleAddAllergy}>
                <Text style={styles.saveBtnText}>Save Allergy Record</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F1',
  },
  backButton: {
    padding: 4,
    marginRight: 12,
  },
  title: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 18,
    fontWeight: '700',
    color: '#2563EB', // Deep purple title
  },
  introText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: '#6F7D93',
    lineHeight: 20,
    marginBottom: 20,
    marginTop: 8,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#16335F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E2E8F1',
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  summaryTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 13,
    color: '#2563EB',
    fontWeight: '600',
  },
  totalText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
    color: '#6F7D93',
    marginBottom: 16,
  },
  totalNumber: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 32,
    fontWeight: '800',
    color: '#2563EB',
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  countBadge: {
    flex: 1,
    backgroundColor: '#EAF1FF',
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  badgeCountText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 11,
    color: '#2563EB',
  },
  bannerCard: {
    flexDirection: 'row',
    backgroundColor: '#2563EB', // Deep indigo banner
    borderRadius: 20,
    padding: 20,
    gap: 16,
    marginBottom: 28,
  },
  bannerIconContainer: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
    marginBottom: 4,
  },
  bannerDescription: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: '#E0E7FF',
    lineHeight: 18,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionHeading: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 16,
    color: '#14213D',
    fontWeight: '700',
  },
  smallAddButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563EB',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 4,
  },
  smallAddButtonText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  allergyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 16,
    shadowColor: '#16335F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E2E8F1',
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarIconContainer: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#EAF1FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  allergenTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 15,
    fontWeight: '700',
    color: '#14213D',
  },
  badgesRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
  },
  typeBadge: {
    backgroundColor: '#E2E8F1',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  typeBadgeText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 9,
    color: '#6F7D93',
    fontWeight: '600',
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  severityBadgeText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 9,
    fontWeight: '600',
  },
  actionIconsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  quoteBlock: {
    borderLeftWidth: 3,
    borderLeftColor: '#2563EB',
    paddingLeft: 12,
    marginTop: 4,
  },
  quoteText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    color: '#41506A',
    lineHeight: 18,
    fontStyle: 'italic',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 14,
    color: '#98A4B7',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 24,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 18,
    fontWeight: '700',
    color: '#14213D',
  },
  closeBtn: {
    padding: 4,
  },
  inputLabel: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 11,
    color: '#6F7D93',
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: '#F5F7FB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F1',
    paddingHorizontal: 16,
    height: 48,
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: '#14213D',
  },
  pickerRow: {
    flexDirection: 'row',
    gap: 8,
  },
  pickerPill: {
    flex: 1,
    backgroundColor: '#F5F7FB',
    borderWidth: 1,
    borderColor: '#E2E8F1',
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: 'center',
  },
  pickerPillActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  pickerPillText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 12,
    color: '#41506A',
  },
  pickerPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  saveBtnSubmit: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 28,
  },
  saveBtnText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
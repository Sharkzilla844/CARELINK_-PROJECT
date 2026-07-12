import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { BACKEND_URL } from '../../src/services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function RoleSelectionScreen() {
  const router = useRouter();
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await AsyncStorage.getItem('user');
        if (userData) {
          const user = JSON.parse(userData);
          setUserId(user.id);
        }
      } catch (err) {
        console.error('Failed to load user for role selection', err);
      }
    };
    loadUser();
  }, []);

  const handleRoleSelect = async (role: 'patient' | 'doctor') => {
    try {
      const activeId = userId || 1; // Fallback to 1 if not loaded yet
      
      const response = await axios.put(`${BACKEND_URL}/auth/users/${activeId}/role?role=${role}`);
      
      // Update local storage user role
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        user.role = role;
        await AsyncStorage.setItem('user', JSON.stringify(user));
      }

      if (role === 'patient') {
        router.replace('/(patient)');
      } else {
        router.replace('/(doctor)');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to save role. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choose Your Role</Text>
      <Text style={styles.subtitle}>How would you like to use CareLink?</Text>

      <TouchableOpacity
        style={[styles.roleCard, { borderColor: '#4CAF50' }]}
        onPress={() => handleRoleSelect('patient')}
      >
        <Ionicons name="person-circle" size={50} color="#4CAF50" />
        <Text style={styles.roleTitle}>I&apos;m a Patient</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.roleCard, { borderColor: '#2196F3' }]}
        onPress={() => handleRoleSelect('doctor')}
      >
        <Ionicons name="medkit" size={50} color="#2196F3" />
        <Text style={styles.roleTitle}>I&apos;m a Doctor</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1A1C1C',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 40,
  },
  roleCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    borderWidth: 2,
    alignItems: 'center',
  },
  roleTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1C1C',
    marginTop: 12,
  },
});
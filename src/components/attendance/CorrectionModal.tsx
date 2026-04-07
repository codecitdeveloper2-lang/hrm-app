import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  KeyboardAvoidingView
} from 'react-native';
import { useCorrectLogoutMutation } from '../../store/api/apiSlice';

interface CorrectionModalProps {
  isVisible: boolean;
  data: {
    shiftId: string;
    shiftDate: string;
    loginTime: string;
  } | null;
}

export default function CorrectionModal({ isVisible, data }: CorrectionModalProps) {
  const [logoutTime, setLogoutTime] = useState('');
  const [reason, setReason] = useState('Forgot to clock out');
  const [remarks, setRemarks] = useState('');
  const [correctLogout, { isLoading }] = useCorrectLogoutMutation();

  const handleSubmit = async () => {
    if (!logoutTime) {
      Alert.alert('Error', 'Please enter a logout time (e.g., 06:00 PM)');
      return;
    }

    try {
      // Create a full ISO date-time string from data.shiftDate and logoutTime
      const datePart = data?.shiftDate?.split('T')[0];
      
      // Basic time parsing (supports "06:30 PM", "18:30", etc.)
      const timeMatch = logoutTime.match(/(\d+):(\d+)\s*(AM|PM)?/i);
      
      if (!timeMatch || !datePart) {
        Alert.alert('Error', 'Please enter a valid time (e.g., 06:30 PM)');
        return;
      }

      let hours = parseInt(timeMatch[1], 10);
      const minutes = timeMatch[2];
      const ampm = timeMatch[3]?.toUpperCase();

      // Handle AM/PM
      if (ampm === 'PM' && hours < 12) hours += 12;
      else if (ampm === 'AM' && hours === 12) hours = 0;
      else if (!ampm && hours < 12) {
        // If no AM/PM provided, check if PM makes more sense (after login)
        const loginDate = new Date(data.loginTime);
        const amDate = new Date(`${datePart}T${hours.toString().padStart(2, '0')}:${minutes}:00.000Z`);
        const pmHours = hours + 12;
        const pmDate = new Date(`${datePart}T${pmHours.toString().padStart(2, '0')}:${minutes}:00.000Z`);
        
        if (amDate < loginDate && pmDate > loginDate) {
          hours = pmHours;
        }
      }

      const isoLogoutTime = `${datePart}T${hours.toString().padStart(2, '0')}:${minutes}:00.000Z`;
      const logoutDate = new Date(isoLogoutTime);
      const loginDate = new Date(data.loginTime);

      if (logoutDate <= loginDate) {
        Alert.alert(
          'Invalid Logout Time', 
          `Logout time must be after login time (${formatTime(data.loginTime)}). Please include AM/PM if necessary.`
        );
        return;
      }

      await correctLogout({
        shiftId: data?.shiftId,
        shiftDate: data?.shiftDate,
        logoutTime: isoLogoutTime,
        reason,
        remarks: remarks || 'Submitted via block modal'
      }).unwrap();
      
      Alert.alert('Success', 'Correction request submitted successfully.');
    } catch (error: any) {
      Alert.alert('Error', error.data?.message || 'Failed to submit correction.');
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeStr: string) => {
    if (!timeStr) return '';
    return new Date(timeStr).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="fade"
    >
      <View style={styles.overlay}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}
        >
          <View style={styles.modalContent}>
            <View style={styles.header}>
              <Text style={styles.headerIcon}>⚠</Text>
              <Text style={styles.headerTitle}>Incomplete Shift</Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
              <Text style={styles.description}>
                You have an incomplete shift record from a previous day. You must submit a logout correction before you can continue using the app.
              </Text>

              <View style={styles.infoBox}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Shift Date:</Text>
                  <Text style={styles.infoValue}>{formatDate(data?.shiftDate || '')}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Login Time:</Text>
                  <Text style={styles.infoValue}>{formatTime(data?.loginTime || '')}</Text>
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Logout Time (HH:MM AM/PM)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 06:30 PM"
                  placeholderTextColor="#94A3B8"
                  value={logoutTime}
                  onChangeText={setLogoutTime}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Reason</Text>
                <TextInput
                  style={styles.input}
                  value={reason}
                  onChangeText={setReason}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Remarks</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  multiline
                  numberOfLines={3}
                  placeholder="Add any additional details..."
                  placeholderTextColor="#94A3B8"
                  value={remarks}
                  onChangeText={setRemarks}
                />
              </View>

              <TouchableOpacity
                style={styles.submitBtn}
                onPress={handleSubmit}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.submitBtnText}>Submit Correction</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    width: '100%',
    maxWidth: 500,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  headerIcon: {
    fontSize: 28,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1E293B',
  },
  scroll: {
    flexGrow: 0,
  },
  description: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
    marginBottom: 20,
  },
  infoBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 13,
    color: '#1E293B',
    fontWeight: '700',
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1E293B',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  submitBtn: {
    backgroundColor: '#EF4444',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});

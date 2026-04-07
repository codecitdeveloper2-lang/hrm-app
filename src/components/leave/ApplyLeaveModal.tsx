import React, { useState, useEffect } from 'react';
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
  KeyboardAvoidingView,
  Switch
} from 'react-native';
import { 
  useCreateLeaveMutation, 
  useGetLeaveTypesQuery,
  useCalculateDaysQuery,
  useGetMyBalanceQuery 
} from '../../store/api/apiSlice';

interface ApplyLeaveModalProps {
  isVisible: boolean;
  onClose: () => void;
}

export default function ApplyLeaveModal({ isVisible, onClose }: ApplyLeaveModalProps) {
  // Form State
  const [leaveType, setLeaveType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isHalfDay, setIsHalfDay] = useState(false);
  const [halfDayType, setHalfDayType] = useState<'first_half' | 'second_half'>('first_half');
  const [reason, setReason] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // API Hooks
  const { data: leaveTypesResp } = useGetLeaveTypesQuery(undefined);
  const { data: balanceResp } = useGetMyBalanceQuery(undefined);
  const [createLeave, { isLoading: isSubmitting }] = useCreateLeaveMutation();
  
  /**
   * Day Calculation via API
   * Triggers whenever dates or half-day toggle change
   */
  const { data: calcResp, isFetching: isCalculating, error: calcError } = useCalculateDaysQuery({
    startDate,
    endDate: isHalfDay ? startDate : endDate,
    halfDay: isHalfDay
  }, { skip: !startDate || (!isHalfDay && !endDate) });

  const balances = balanceResp?.data?.balances || [];
  const leaveTypes = leaveTypesResp?.data || [];
  
  // Logic from web version for balance matching
  const normalizedSearch = leaveType.toLowerCase().replace(" leave", "");
  const selectedBalance = balances.find((b: any) => {
    const bTypeName = b.name || "";
    const normalizedBalanceType = bTypeName.toLowerCase().replace(" leave", "");
    return normalizedBalanceType === normalizedSearch || b.code === leaveType;
  });

  const requestedDays = calcResp?.data?.numberOfDays || 0;
  
  // Logic from web version for insufficient check
  const isInsufficient = selectedBalance && 
                         selectedBalance.isPaid !== false && 
                         selectedBalance.currentBalance !== null && 
                         requestedDays > (selectedBalance.currentBalance || 0);

  // Initialize form when opened
  useEffect(() => {
    if (isVisible) {
      setLeaveType('');
      setStartDate('');
      setEndDate('');
      setIsHalfDay(false);
      setHalfDayType('first_half');
      setReason('');
      setErrors({});
    }
  }, [isVisible]);

  const handleSubmit = async () => {
    // Validation
    const newErrors: Record<string, string> = {};
    if (!leaveType) newErrors.leaveType = 'Selection required';
    if (!startDate) newErrors.startDate = 'Required';
    if (!isHalfDay && !endDate) newErrors.endDate = 'Required';
    if (!reason.trim()) newErrors.reason = 'Reason required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (isInsufficient) {
      Alert.alert('Policy Violation', 'You do not have enough balance for this request.');
      return;
    }

    try {
      // 1:1 Payload match with Web CRM
      const payload = {
        leaveType,
        startDate,
        endDate: isHalfDay ? startDate : endDate,
        halfDay: isHalfDay,
        halfDayType: isHalfDay ? halfDayType : undefined,
        reason: reason.trim()
      };

      await createLeave(payload).unwrap();
      
      Alert.alert('Success 🎉', 'Leave request submitted successfully.');
      onClose();
    } catch (err: any) {
      const msg = err.data?.error?.message || err.data?.message || 'Failed to submit. Please check your network and input.';
      Alert.alert('Submission Failed', msg);
    }
  };

  return (
    <Modal visible={isVisible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
          style={styles.flexView}
        >
          <View style={styles.modalBody}>
            {/* Modal Header */}
            <View style={styles.header}>
              <View>
                <Text style={styles.title}>Apply Leave</Text>
                <Text style={styles.subtitle}>Fill in details to submit request</Text>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <Text style={styles.closeIcon}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
              
              {/* Leave Type Selector */}
              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                    <Text style={styles.label}>LEAVE TYPE</Text>
                    {selectedBalance && (
                        <Text style={styles.balanceInfo}>Balance: {selectedBalance.currentBalance ?? '∞'} days</Text>
                    )}
                </View>
                <View style={styles.typeGrid}>
                  {leaveTypes.map((type: any) => (
                    <TouchableOpacity 
                      key={type._id} 
                      style={[styles.typeOption, leaveType === type.code && styles.typeOptionSelected, errors.leaveType && styles.errorBorder]}
                      onPress={() => { setLeaveType(type.code); setErrors({...errors, leaveType: ''}); }}
                    >
                      <Text style={[styles.typeOptionText, leaveType === type.code && styles.typeOptionTextSelected]}>{type.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Date Inputs */}
              <View style={styles.row}>
                <View style={[styles.inputGroup, {flex: 1}]}>
                  <Text style={styles.label}>START DATE</Text>
                  <TextInput
                    style={[styles.input, errors.startDate && styles.errorBorder]}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor="#94A3B8"
                    value={startDate}
                    onChangeText={(t) => {setStartDate(t); setErrors({...errors, startDate: ''});}}
                  />
                </View>
                {!isHalfDay && (
                  <View style={[styles.inputGroup, {flex: 1}]}>
                    <Text style={styles.label}>END DATE</Text>
                    <TextInput
                      style={[styles.input, errors.endDate && styles.errorBorder]}
                      placeholder="YYYY-MM-DD"
                      placeholderTextColor="#94A3B8"
                      value={endDate}
                      onChangeText={(t) => {setEndDate(t); setErrors({...errors, endDate: ''});}}
                    />
                  </View>
                )}
              </View>

              {/* Half Day Configuration */}
              <View style={styles.switchRow}>
                <View>
                    <Text style={styles.label}>HALF DAY</Text>
                    <Text style={styles.hint}>Single day, 4 hour request</Text>
                </View>
                <Switch 
                    value={isHalfDay} 
                    onValueChange={(v) => { setIsHalfDay(v); if(v) setEndDate(''); }}
                    trackColor={{ false: '#E2E8F0', true: '#6C63FF' }}
                />
              </View>

              {isHalfDay && (
                <View style={[styles.row, {marginTop: 12}]}>
                  <TouchableOpacity 
                    style={[styles.halfToggle, halfDayType === 'first_half' && styles.halfToggleActive]}
                    onPress={() => setHalfDayType('first_half')}
                  >
                    <Text style={[styles.halfToggleText, halfDayType === 'first_half' && styles.halfToggleTextActive]}>1st Half</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.halfToggle, halfDayType === 'second_half' && styles.halfToggleActive]}
                    onPress={() => setHalfDayType('second_half')}
                  >
                    <Text style={[styles.halfToggleText, halfDayType === 'second_half' && styles.halfToggleTextActive]}>2nd Half</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Calculated Summary Box */}
              {((startDate && (endDate || isHalfDay)) || isCalculating) && (
                <View style={[styles.summaryBox, isInsufficient && styles.summaryBoxError]}>
                  {isCalculating ? (
                      <ActivityIndicator size="small" color="#6C63FF" />
                  ) : calcResp?.status === 'success' ? (
                      <View style={{alignItems: 'center'}}>
                          <Text style={[styles.summaryText, isInsufficient && styles.summaryTextError]}>
                              Requested: <Text style={{fontWeight: '800'}}>{calcResp.data.numberOfDays} Day(s)</Text>
                          </Text>
                          {isInsufficient && <Text style={styles.insufficientWarn}>⚠️ Insufficient available balance</Text>}
                      </View>
                  ) : calcError ? (
                      <Text style={styles.insufficientWarn}>Invalid date range or policy</Text>
                  ) : null}
                </View>
              )}

              {/* Reason / Remarks */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>REASON</Text>
                <TextInput
                  style={[styles.input, styles.textArea, errors.reason && styles.errorBorder]}
                  multiline
                  placeholder="Explain why you're taking leave..."
                  placeholderTextColor="#94A3B8"
                  value={reason}
                  onChangeText={(t) => {setReason(t); setErrors({...errors, reason: ''});}}
                />
              </View>

              {/* Bottom Actions */}
              <View style={styles.footer}>
                <TouchableOpacity 
                  style={[styles.submitAction, (isSubmitting || isCalculating || isInsufficient) && styles.submitActionDisabled]}
                  onPress={handleSubmit}
                  disabled={isSubmitting || isCalculating || isInsufficient}
                >
                  {isSubmitting ? <ActivityIndicator color="#FFF" /> : <Text style={styles.submitActionText}>Submit Application</Text>}
                </TouchableOpacity>
                <TouchableOpacity style={styles.discardBtn} onPress={onClose}>
                  <Text style={styles.discardText}>Cancel</Text>
                </TouchableOpacity>
              </View>

            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.85)', justifyContent: 'flex-end' },
  flexView: { width: '100%' },
  modalBody: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 36, borderTopRightRadius: 36, padding: 24, maxHeight: '92%' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 },
  title: { fontSize: 26, fontWeight: '800', color: '#1E293B' },
  subtitle: { fontSize: 13, color: '#64748B', marginTop: 4 },
  closeBtn: { backgroundColor: '#F1F5F9', padding: 12, borderRadius: 16 },
  closeIcon: { fontSize: 16, color: '#64748B' },
  
  scroll: { paddingBottom: 20 },
  inputGroup: { marginBottom: 22 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  label: { fontSize: 12, fontWeight: '800', color: '#475569', letterSpacing: 1 },
  balanceInfo: { fontSize: 11, fontWeight: '700', color: '#6C63FF', backgroundColor: 'rgba(108, 99, 255, 0.1)', paddingVertical: 4, paddingHorizontal: 12, borderRadius: 10 },
  
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  typeOption: { paddingVertical: 12, paddingHorizontal: 18, borderRadius: 14, backgroundColor: '#F8FAFC', borderWidth: 1.5, borderColor: '#E2E8F0' },
  typeOptionSelected: { backgroundColor: '#6C63FF', borderColor: '#6C63FF' },
  typeOptionText: { fontSize: 14, fontWeight: '700', color: '#64748B' },
  typeOptionTextSelected: { color: '#FFFFFF' },
  
  row: { flexDirection: 'row', gap: 14 },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  input: { flex: 1, backgroundColor: '#F8FAFC', borderRadius: 16, paddingHorizontal: 18, paddingVertical: 14, fontSize: 15, color: '#1E293B', borderWidth: 1.5, borderColor: '#E2E8F0' },
  errorBorder: { borderColor: '#EF4444' },
  textArea: { minHeight: 110, textAlignVertical: 'top' },
  hint: { fontSize: 11, color: '#94A3B8', marginTop: 3 },
  
  halfToggle: { flex: 1, paddingVertical: 14, borderRadius: 14, backgroundColor: '#F8FAFC', borderWidth: 1.5, borderColor: '#E2E8F0', alignItems: 'center' },
  halfToggleActive: { borderColor: '#6C63FF', backgroundColor: 'rgba(108, 99, 255, 0.05)' },
  halfToggleText: { fontSize: 14, fontWeight: '700', color: '#64748B' },
  halfToggleTextActive: { color: '#6C63FF' },
  
  summaryBox: { backgroundColor: 'rgba(16, 185, 129, 0.06)', padding: 18, borderRadius: 24, marginBottom: 24, borderWidth: 1, borderColor: 'rgba(16, 185, 129, 0.2)' },
  summaryBoxError: { backgroundColor: 'rgba(239, 68, 68, 0.06)', borderColor: 'rgba(239, 68, 68, 0.2)' },
  summaryText: { fontSize: 15, color: '#065F46', fontWeight: '600' },
  summaryTextError: { color: '#EF4444' },
  insufficientWarn: { color: '#EF4444', fontSize: 12, fontWeight: '700', marginTop: 5 },
  
  footer: { gap: 14, marginTop: 10 },
  submitAction: { backgroundColor: '#6C63FF', paddingVertical: 18, borderRadius: 22, alignItems: 'center', shadowColor: '#6C63FF', shadowOpacity: 0.35, shadowRadius: 12, elevation: 6 },
  submitActionDisabled: { backgroundColor: '#CBD5E1', shadowOpacity: 0, elevation: 0 },
  submitActionText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  discardBtn: { alignItems: 'center', paddingVertical: 12 },
  discardText: { fontSize: 14, color: '#64748B', fontWeight: '700' },
});

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
  KeyboardAvoidingView
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
  
  // Custom Date Picker State
  const [pickerTarget, setPickerTarget] = useState<'start' | 'end' | null>(null);
  const [pickerDate, setPickerDate] = useState(new Date());

  const daysInMonth = new Date(pickerDate.getFullYear(), pickerDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(pickerDate.getFullYear(), pickerDate.getMonth(), 1).getDay();

  const handleDaySelect = (day: number) => {
    const formatted = `${String(pickerDate.getMonth() + 1).padStart(2, '0')}/${String(day).padStart(2, '0')}/${pickerDate.getFullYear()}`;
    if (pickerTarget === 'start') {
      setStartDate(formatted);
      setErrors({...errors, startDate: ''});
    } else if (pickerTarget === 'end') {
      setEndDate(formatted);
      setErrors({...errors, endDate: ''});
    }
    setPickerTarget(null);
  };
  
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
      setPickerTarget(null);
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
    <Modal visible={isVisible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
          style={styles.flexView}
        >
          <View style={styles.modalBody}>
            {/* Modal Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Apply for Leave</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <Text style={styles.closeIcon}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
              
              {/* Leave Type Selector */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Leave Type <Text style={styles.required}>*</Text></Text>
                <View style={styles.typeGrid}>
                  {leaveTypes.map((type: any) => {
                    const bTypeName = type.name || "";
                    const norm = bTypeName.toLowerCase().replace(" leave", "");
                    const bal = balances.find((b:any) => {
                        const bn = (b.name||"").toLowerCase().replace(" leave", "");
                        return bn === norm || b.code === type.code;
                    });
                    
                    return (
                      <TouchableOpacity 
                        key={type._id} 
                        style={[styles.typeCard, leaveType === type.code && styles.typeCardSelected, errors.leaveType && styles.errorBorder]}
                        onPress={() => { setLeaveType(type.code); setErrors({...errors, leaveType: ''}); }}
                      >
                        <Text style={styles.typeIconText}>📄</Text>
                        <Text style={[styles.typeOptionText, leaveType === type.code && styles.typeOptionTextSelected]} numberOfLines={1}>{type.name}</Text>
                        <Text style={styles.typeAvailableText}>
                            {bal?.currentBalance ?? '∞'} available
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Half Day Checkbox */}
              <TouchableOpacity style={styles.checkboxRow} onPress={() => { setIsHalfDay(!isHalfDay); if(!isHalfDay) setEndDate(''); }}>
                <View style={[styles.checkbox, isHalfDay && styles.checkboxChecked]}>
                  {isHalfDay && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.checkboxLabel}>Half Day Leave</Text>
              </TouchableOpacity>

              {isHalfDay && (
                <View style={[styles.row, {marginBottom: 20}]}>
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

              {/* Date Inputs */}
              {(() => {
                const renderDatePicker = () => {
                    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
                    const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
                    const days = [];
                    for (let i = 0; i < firstDayOfMonth; i++) days.push(null);
                    for (let i = 1; i <= daysInMonth; i++) days.push(i);
                    
                    return (
                        <View style={styles.datePickerContainer}>
                            <View style={styles.datePickerHeader}>
                                <Text style={styles.datePickerMonthText}>{monthNames[pickerDate.getMonth()]} {pickerDate.getFullYear()}</Text>
                                <View style={{flexDirection: 'row', gap: 16}}>
                                    <TouchableOpacity onPress={() => setPickerDate(new Date(pickerDate.getFullYear(), pickerDate.getMonth() - 1, 1))}>
                                        <Text style={{fontSize: 16, color: '#64748B'}}>↑</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => setPickerDate(new Date(pickerDate.getFullYear(), pickerDate.getMonth() + 1, 1))}>
                                        <Text style={{fontSize: 16, color: '#64748B'}}>↓</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                            <View style={styles.datePickerDaysHeader}>
                                {weekDays.map((d, i) => <Text key={i} style={styles.datePickerDayLabel}>{d}</Text>)}
                            </View>
                            <View style={styles.datePickerGrid}>
                                {days.map((d, i) => {
                                    const isSelected = d !== null && (pickerTarget === 'start' ? startDate : endDate) === `${String(pickerDate.getMonth()+1).padStart(2,'0')}/${String(d).padStart(2,'0')}/${pickerDate.getFullYear()}`;
                                    return (
                                        <TouchableOpacity 
                                            key={i} 
                                            style={[styles.datePickerCell, isSelected && styles.datePickerCellSelected]} 
                                            disabled={d === null}
                                            onPress={() => d !== null && handleDaySelect(d)}
                                        >
                                            <Text style={[styles.datePickerCellText, isSelected && styles.datePickerCellTextSelected]}>{d || ''}</Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                            <View style={styles.datePickerFooter}>
                                <TouchableOpacity onPress={() => { pickerTarget === 'start' ? setStartDate('') : setEndDate(''); setPickerTarget(null); }}>
                                    <Text style={{color: '#6B9CFD', fontSize: 13, fontWeight: '600'}}>Clear</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => { setPickerDate(new Date()); handleDaySelect(new Date().getDate()); }}>
                                    <Text style={{color: '#6B9CFD', fontSize: 13, fontWeight: '600'}}>Today</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    );
                };

                return (
                  <View style={[styles.row, { zIndex: pickerTarget ? 50 : 1 }]}>
                    <View style={[styles.inputGroup, {flex: 1, position: 'relative'}]}>
                      <Text style={styles.label}>Start Date <Text style={styles.required}>*</Text></Text>
                      <TouchableOpacity
                        style={[styles.input, {height: 42, justifyContent: 'center'}, errors.startDate && styles.errorBorder]}
                        onPress={() => { setPickerTarget(pickerTarget === 'start' ? null : 'start'); setPickerDate(startDate ? new Date(startDate) : new Date()); }}
                      >
                        <Text style={{color: startDate ? '#1E293B' : '#94A3B8', fontSize: 13}}>{startDate || "mm/dd/yyyy"}</Text>
                        <Text style={{position:'absolute', right: 12, top: 10, color:'#64748B'}}>📅</Text>
                      </TouchableOpacity>
                      
                      {pickerTarget === 'start' && renderDatePicker()}
                    </View>
                    {!isHalfDay && (
                      <View style={[styles.inputGroup, {flex: 1, position: 'relative'}]}>
                        <Text style={styles.label}>End Date <Text style={styles.required}>*</Text></Text>
                        <TouchableOpacity
                          style={[styles.input, {height: 42, justifyContent: 'center'}, errors.endDate && styles.errorBorder]}
                          onPress={() => { setPickerTarget(pickerTarget === 'end' ? null : 'end'); setPickerDate(endDate ? new Date(endDate) : new Date()); }}
                        >
                          <Text style={{color: endDate ? '#1E293B' : '#94A3B8', fontSize: 13}}>{endDate || "mm/dd/yyyy"}</Text>
                          <Text style={{position:'absolute', right: 12, top: 10, color:'#64748B'}}>📅</Text>
                        </TouchableOpacity>
                        
                        {pickerTarget === 'end' && renderDatePicker()}
                      </View>
                    )}
                  </View>
                );
              })()}

              {/* Calculated Summary Box (Kept for functionality but subtly styled) */}
              {((startDate && (endDate || isHalfDay)) || isCalculating) && (
                <View style={[styles.summaryBox, isInsufficient && styles.summaryBoxError]}>
                  {isCalculating ? (
                      <ActivityIndicator size="small" color="#6B9CFD" />
                  ) : calcResp?.status === 'success' ? (
                      <View>
                          <Text style={[styles.summaryText, isInsufficient && styles.summaryTextError]}>
                              Requested: <Text style={{fontWeight: '700'}}>{calcResp.data.numberOfDays} Day(s)</Text>
                          </Text>
                          {isInsufficient && <Text style={styles.insufficientWarn}>⚠️ Insufficient available balance</Text>}
                      </View>
                  ) : calcError ? (
                      <Text style={styles.insufficientWarn}>Invalid date range</Text>
                  ) : null}
                </View>
              )}

              {/* Reason / Remarks */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Reason <Text style={styles.required}>*</Text></Text>
                <TextInput
                  style={[styles.input, styles.textArea, errors.reason && styles.errorBorder]}
                  multiline
                  placeholder="Please explain why you need to take leave..."
                  placeholderTextColor="#94A3B8"
                  value={reason}
                  onChangeText={(t) => {setReason(t); setErrors({...errors, reason: ''});}}
                />
              </View>

              {/* Bottom Actions */}
              <View style={styles.footer}>
                <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.submitBtn, (isSubmitting || isCalculating || isInsufficient) && styles.submitBtnDisabled]}
                  onPress={handleSubmit}
                  disabled={isSubmitting || isCalculating || isInsufficient}
                >
                  {isSubmitting ? <ActivityIndicator color="#FFF" /> : <Text style={styles.submitBtnText}>Submit Request</Text>}
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
  overlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0, 0, 0, 0.4)', 
    justifyContent: 'center', 
    alignItems: 'center',
    padding: 20
  },
  flexView: { width: '100%', maxWidth: 500 },
  modalBody: { 
    backgroundColor: '#FFFFFF', 
    borderRadius: 8, 
    padding: 24, 
    width: '100%',
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5
  },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 16
  },
  title: { fontSize: 18, fontWeight: '600', color: '#1E293B' },
  closeBtn: { padding: 4 },
  closeIcon: { fontSize: 20, color: '#64748B' },
  
  scroll: { paddingBottom: 10 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 13, fontWeight: '500', color: '#1E293B', marginBottom: 8 },
  required: { color: '#EF4444' },
  
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  typeCard: { 
    paddingVertical: 12, 
    paddingHorizontal: 16, 
    borderRadius: 8, 
    backgroundColor: '#FFFFFF', 
    borderWidth: 1, 
    borderColor: '#E2E8F0',
    minWidth: 100,
    alignItems: 'flex-start'
  },
  typeCardSelected: { borderColor: '#6B9CFD', backgroundColor: '#F8FAFC' },
  typeIconText: { fontSize: 20, marginBottom: 4 },
  typeOptionText: { fontSize: 14, fontWeight: '500', color: '#333' },
  typeOptionTextSelected: { color: '#111' },
  typeAvailableText: { fontSize: 11, color: '#64748B', marginTop: 2 },
  
  checkboxRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  checkbox: { 
    width: 18, 
    height: 18, 
    borderWidth: 1, 
    borderColor: '#CBD5E1', 
    borderRadius: 4, 
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF'
  },
  checkboxChecked: { backgroundColor: '#6B9CFD', borderColor: '#6B9CFD' },
  checkmark: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
  checkboxLabel: { fontSize: 14, color: '#1E293B' },
  
  row: { flexDirection: 'row', gap: 16 },
  input: { 
    backgroundColor: '#FFFFFF', 
    borderRadius: 6, 
    paddingHorizontal: 14, 
    paddingVertical: 10, 
    fontSize: 14, 
    color: '#1E293B', 
    borderWidth: 1, 
    borderColor: '#E2E8F0' 
  },
  errorBorder: { borderColor: '#EF4444' },
  textArea: { minHeight: 90, textAlignVertical: 'top' },
  
  halfToggle: { flex: 1, paddingVertical: 10, borderRadius: 6, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center' },
  halfToggleActive: { borderColor: '#6B9CFD', backgroundColor: '#F0F5FF' },
  halfToggleText: { fontSize: 13, fontWeight: '500', color: '#64748B' },
  halfToggleTextActive: { color: '#6B9CFD' },
  
  summaryBox: { backgroundColor: '#F8FAFC', padding: 12, borderRadius: 6, marginBottom: 20, borderWidth: 1, borderColor: '#E2E8F0' },
  summaryBoxError: { backgroundColor: '#FEF2F2', borderColor: '#FECACA' },
  summaryText: { fontSize: 13, color: '#334155' },
  summaryTextError: { color: '#EF4444' },
  insufficientWarn: { color: '#EF4444', fontSize: 12, fontWeight: '600', marginTop: 4 },
  
  footer: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 10, borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 20 },
  submitBtn: { backgroundColor: '#6B9CFD', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 6, alignItems: 'center', opacity: 1 },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '500' },
  cancelBtn: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 6, borderWidth: 1, borderColor: '#6B9CFD', backgroundColor: '#FFFFFF' },
  cancelBtnText: { fontSize: 14, color: '#6B9CFD', fontWeight: '500' },
  
  datePickerContainer: {
    position: 'absolute',
    top: 65,
    left: 0,
    width: 250,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    zIndex: 100,
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  datePickerMonthText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B'
  },
  datePickerDaysHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  datePickerDayLabel: {
    width: `${100 / 7}%`,
    textAlign: 'center',
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  datePickerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  datePickerCell: {
    width: `${100 / 7}%`,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 6,
  },
  datePickerCellSelected: {
    backgroundColor: '#6B9CFD',
  },
  datePickerCellText: {
    fontSize: 12,
    color: '#1E293B',
    fontWeight: '500',
  },
  datePickerCellTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  datePickerFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderColor: '#E2E8F0',
  },
});

import React, { useState, useEffect } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    Modal, 
    TouchableOpacity, 
    TextInput, 
    ScrollView, 
    ActivityIndicator, 
    Alert 
} from 'react-native';
import { COLORS } from '../../styles';
import { 
    useGetReimbursementTypesQuery, 
    useCreateReimbursementMutation, 
    useUpdateReimbursementMutation 
} from '../../store/api/apiSlice';
import { formatCurrency } from '../../utils';

interface NewReimbursementModalProps {
    isVisible: boolean;
    onClose: () => void;
    editingRequest?: any;
}

export default function NewReimbursementModal({ isVisible, onClose, editingRequest }: NewReimbursementModalProps) {
    const [title, setTitle] = useState('');
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [description, setDescription] = useState('');
    const [typeId, setTypeId] = useState('');
    const [attachments, setAttachments] = useState<any[]>([]);

    const { data: typesResp, isLoading: typesLoading } = useGetReimbursementTypesQuery(undefined);
    const [createReimbursement, { isLoading: isCreating }] = useCreateReimbursementMutation();
    const [updateReimbursement, { isLoading: isUpdating }] = useUpdateReimbursementMutation();

    useEffect(() => {
        if (editingRequest) {
            setTitle(editingRequest.title);
            setAmount(editingRequest.amount.toString());
            setDate(new Date(editingRequest.expenseDate).toISOString().split('T')[0]);
            setDescription(editingRequest.description || '');
            setTypeId(editingRequest.reimbursementTypeId || editingRequest.reimbursementType);
            setAttachments(editingRequest.attachments || []);
        } else {
            resetForm();
        }
    }, [editingRequest, isVisible]);

    const resetForm = () => {
        setTitle('');
        setAmount('');
        setDate(new Date().toISOString().split('T')[0]);
        setDescription('');
        setTypeId('');
        setAttachments([]);
    };

    const handleClose = () => {
        if (!editingRequest) resetForm();
        onClose();
    };

    const handleSubmit = async () => {
        if (!title || !amount || !date || !typeId) {
            Alert.alert("Error", "Please fill in all required fields.");
            return;
        }

        const selectedType = typesResp?.data?.find((t: any) => t._id === typeId || t.name === typeId);
        if (selectedType) {
            if (selectedType.maxAmount && parseFloat(amount) > selectedType.maxAmount) {
                Alert.alert("Error", `Maximum amount for ${selectedType.name} is ${formatCurrency(selectedType.maxAmount)}`);
                return;
            }
            if (selectedType.requiresReceipt && attachments.length === 0) {
                Alert.alert("Warning", `A receipt is required for ${selectedType.name} reimbursements.`);
                // For now, we'll allow submitting but warn. In real app, we'd enforce it.
            }
        }

        const payload = {
            title,
            amount: parseFloat(amount),
            expenseDate: date,
            description,
            reimbursementTypeId: selectedType?._id || typeId,
            reimbursementType: selectedType?.name || typeId,
            attachments: attachments.length > 0 ? attachments : undefined,
        };

        try {
            if (editingRequest) {
                await updateReimbursement({ id: editingRequest._id, data: payload }).unwrap();
                Alert.alert("Success", "Request updated successfully.");
            } else {
                await createReimbursement(payload).unwrap();
                Alert.alert("Success", "Request submitted successfully.");
            }
            handleClose();
        } catch (err: any) {
            Alert.alert("Error", err.data?.message || "Something went wrong.");
        }
    };

    const reimbursementTypes = typesResp?.data || [];

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={isVisible}
            onRequestClose={handleClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>{editingRequest ? 'Edit Request' : 'New Reimbursement'}</Text>
                        <TouchableOpacity onPress={handleClose}>
                            <Text style={styles.closeBtn}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Category *</Text>
                            <View style={styles.typeGrid}>
                                {reimbursementTypes.map((type: any) => (
                                    <TouchableOpacity 
                                        key={type._id} 
                                        style={[
                                            styles.typeItem, 
                                            typeId === type._id && styles.typeItemActive
                                        ]}
                                        onPress={() => setTypeId(type._id)}
                                    >
                                        <Text style={[
                                            styles.typeText,
                                            typeId === type._id && styles.typeTextActive
                                        ]}>{type.name}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                            {reimbursementTypes.length === 0 && !typesLoading && (
                                <Text style={styles.errorText}>No categories available.</Text>
                            )}
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Title *</Text>
                            <TextInput 
                                style={styles.input}
                                value={title}
                                onChangeText={setTitle}
                                placeholder="Business Lunch, Taxi, etc."
                                placeholderTextColor="#94A3B8"
                            />
                        </View>

                        <View style={styles.row}>
                            <View style={[styles.formGroup, { flex: 1 }]}>
                                <Text style={styles.label}>Amount *</Text>
                                <TextInput 
                                    style={styles.input}
                                    value={amount}
                                    onChangeText={setAmount}
                                    keyboardType="numeric"
                                    placeholder="0.00"
                                    placeholderTextColor="#94A3B8"
                                />
                            </View>
                            <View style={[styles.formGroup, { flex: 1, marginLeft: 15 }]}>
                                <Text style={styles.label}>Date *</Text>
                                <TextInput 
                                    style={styles.input}
                                    value={date}
                                    onChangeText={setDate}
                                    placeholder="YYYY-MM-DD"
                                    placeholderTextColor="#94A3B8"
                                />
                            </View>
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Description</Text>
                            <TextInput 
                                style={[styles.input, styles.textArea]}
                                value={description}
                                onChangeText={setDescription}
                                multiline
                                numberOfLines={4}
                                placeholder="Details about this expense..."
                                placeholderTextColor="#94A3B8"
                                textAlignVertical="top"
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Receipts</Text>
                            <TouchableOpacity 
                                style={styles.uploadBtn}
                                onPress={() => Alert.alert("Note", "File upload requires react-native-document-picker. Please install it on a real device.")}
                            >
                                <Text style={styles.uploadIcon}>📁</Text>
                                <Text style={styles.uploadText}>Attach Receipt</Text>
                            </TouchableOpacity>
                            {attachments.length > 0 && (
                                <View style={styles.attachmentList}>
                                    {attachments.map((file: any, index: number) => (
                                        <View key={index} style={styles.attachmentItem}>
                                            <Text style={styles.attachmentName} numberOfLines={1}>
                                                {file.fileName || 'Receipt'}
                                            </Text>
                                            <TouchableOpacity onPress={() => setAttachments(prev => prev.filter((_, i) => i !== index))}>
                                                <Text style={styles.removeIcon}>✕</Text>
                                            </TouchableOpacity>
                                        </View>
                                    ))}
                                </View>
                            )}
                        </View>
                        
                        <View style={{height: 20}} />
                    </ScrollView>

                    <View style={styles.modalFooter}>
                        <TouchableOpacity style={styles.cancelBtn} onPress={handleClose} disabled={isCreating || isUpdating}>
                            <Text style={styles.cancelBtnText}>Discard</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={styles.submitBtn} 
                            onPress={handleSubmit}
                            disabled={isCreating || isUpdating}
                        >
                            {(isCreating || isUpdating) ? (
                                <ActivityIndicator color="#FFF" size="small" />
                            ) : (
                                <Text style={styles.submitBtnText}>{editingRequest ? 'Update Request' : 'Submit Claim'}</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#FFF',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        height: '85%',
        paddingTop: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 25,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    modalTitle: { fontSize: 20, fontWeight: '800', color: '#1E293B' },
    closeBtn: { fontSize: 20, color: '#94A3B8', fontWeight: 'bold' },
    
    scrollContent: { paddingHorizontal: 25, paddingTop: 20 },
    formGroup: { marginBottom: 20 },
    label: { fontSize: 13, fontWeight: '700', color: '#64748B', marginBottom: 8 },
    input: {
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 12,
        paddingHorizontal: 15,
        paddingVertical: 12,
        fontSize: 15,
        color: '#1E293B',
    },
    textArea: { height: 100 },
    row: { flexDirection: 'row' },
    
    typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    typeItem: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 10,
        backgroundColor: '#F1F5F9',
        borderWidth: 1,
        borderColor: 'transparent',
    },
    typeItemActive: {
        backgroundColor: COLORS.accent,
        borderColor: COLORS.accent,
    },
    typeText: { fontSize: 12, fontWeight: '600', color: '#64748B' },
    typeTextActive: { color: '#FFF' },
    
    uploadBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        paddingVertical: 15,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderStyle: 'dashed',
        backgroundColor: '#F8FAFC',
    },
    uploadIcon: { fontSize: 20 },
    uploadText: { color: '#64748B', fontWeight: '700', fontSize: 13 },
    
    attachmentList: { marginTop: 15, gap: 10 },
    attachmentItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#F1F5F9',
        padding: 12,
        borderRadius: 12,
    },
    attachmentName: { fontSize: 12, color: '#1E293B', fontWeight: '600', flex: 1 },
    removeIcon: { fontSize: 16, color: COLORS.error, fontWeight: 'bold', marginLeft: 10 },
    
    modalFooter: {
        flexDirection: 'row',
        gap: 15,
        padding: 25,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
    },
    cancelBtn: {
        flex: 1,
        paddingVertical: 15,
        alignItems: 'center',
        borderRadius: 15,
        backgroundColor: '#F1F5F9',
    },
    cancelBtnText: { color: '#64748B', fontWeight: '800', fontSize: 14 },
    submitBtn: {
        flex: 2,
        paddingVertical: 15,
        alignItems: 'center',
        borderRadius: 15,
        backgroundColor: COLORS.accent,
        shadowColor: COLORS.accent,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    submitBtnText: { color: '#FFF', fontWeight: '800', fontSize: 14 },
    errorText: { color: COLORS.error, fontSize: 11, marginTop: 4 },
});

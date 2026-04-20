import { useTheme } from '../../styles/ThemeProvider';
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
    Alert,
    Platform,
    Image,
    ImageBackground
} from 'react-native';

import { launchImageLibrary } from 'react-native-image-picker';

import { 
    useGetReimbursementTypesQuery, 
    useCreateReimbursementMutation, 
    useUpdateReimbursementMutation 
} from '../../store/api/apiSlice';

interface NewReimbursementModalProps {
    isVisible: boolean;
    onClose: () => void;
    editingRequest?: any;
}

export default function NewReimbursementModal({ isVisible, onClose, editingRequest }: NewReimbursementModalProps) {
  const { colors: THEME_COLORS } = useTheme();
  const styles = _getStyles(THEME_COLORS);
    const [title, setTitle] = useState('');
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState('');
    const [description, setDescription] = useState('');
    const [typeId, setTypeId] = useState('');
    const [attachments, setAttachments] = useState<any[]>([]);

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const { data: typesResp } = useGetReimbursementTypesQuery(undefined);
    const [createReimbursement, { isLoading: isCreating }] = useCreateReimbursementMutation();
    const [updateReimbursement, { isLoading: isUpdating }] = useUpdateReimbursementMutation();

    useEffect(() => {
        console.log('NewReimbursementModal Mounted');
    }, []);

    useEffect(() => {
        if (isVisible) {
            console.log('NewReimbursementModal is now visible');
            if (editingRequest) {
                setTitle(editingRequest.title);
                setAmount(editingRequest.amount.toString());
                
                // Format the requested date to DD-MM-YYYY if possible, or leave as is
                const d = new Date(editingRequest.expenseDate);
                const dd = String(d.getDate()).padStart(2, '0');
                const mm = String(d.getMonth() + 1).padStart(2, '0');
                const yyyy = d.getFullYear();
                setDate(`${dd}-${mm}-${yyyy}`);
                
                setDescription(editingRequest.description || '');
                setTypeId(editingRequest.reimbursementTypeId || editingRequest.reimbursementType);
                setAttachments(editingRequest.attachments || []);
            } else {
                resetForm();
            }
        }
    }, [editingRequest, isVisible]);

    const resetForm = () => {
        setTitle('');
        setAmount('');
        const d = new Date();
        setDate(`${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`);
        setDescription('');
        setTypeId('');
        setAttachments([]);
        setIsDropdownOpen(false);
    };

    const handleClose = () => {
        if (!editingRequest) resetForm();
        onClose();
    };

    const parseDateToISO = (dateStr: string) => {
        // Handle both DD-MM-YYYY and DD/MM/YYYY
        const separator = dateStr.includes('-') ? '-' : '/';
        const parts = dateStr.split(separator);
        
        if (parts.length === 3) {
            // Check if year is first (YYYY-MM-DD or YYYY/MM/DD)
            if (parts[0].length === 4) {
                return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}T00:00:00.000Z`;
            }
            // Assume DD-MM-YYYY
            return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}T00:00:00.000Z`;
        }
        return dateStr;
    }

    const handlePickDocument = async () => {
        // WEB FALLBACK
        if (Platform.OS === 'web') {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.multiple = true;
            
            input.onchange = async (e: any) => {
                const files = e.target.files;
                if (!files) return;
                
                const filePromises = Array.from(files).map((file: any) => {
                    return new Promise((resolve) => {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                            resolve({
                                fileName: file.name,
                                fileUrl: reader.result,
                                type: file.type,
                                size: file.size
                            });
                        };
                        reader.readAsDataURL(file);
                    });
                });
                
                const newAttachments = await Promise.all(filePromises);
                setAttachments(prev => [...prev, ...newAttachments]);
            };
            
            input.click();
            return;
        }

        try {
            const result = await launchImageLibrary({
                mediaType: 'photo',
                selectionLimit: 0, 
                includeBase64: true, // Need base64 for backend validation
            });

            if (result.didCancel) {
                return;
            }

            if (result.errorCode) {
                Alert.alert('Error', result.errorMessage || 'Unknown error occurred');
                return;
            }

            if (result.assets) {
                const newAttachments = result.assets.map(asset => ({
                    fileName: asset.fileName || 'image',
                    fileUrl: asset.base64 ? `data:${asset.type || 'image/jpeg'};base64,${asset.base64}` : asset.uri,
                    type: asset.type,
                    size: asset.fileSize
                }));
                setAttachments(prev => [...prev, ...newAttachments]);
            }
        } catch (err: any) {
            console.error('ImagePicker Error: ', err);
            Alert.alert("Error", "Could not open image picker.");
        }
    };

    const handleSubmit = async () => {
        if (!title || !amount || !date || !typeId) {
            Alert.alert("Error", "Please fill in all required fields.");
            return;
        }

        const selectedType = typesResp?.data?.find((t: any) => 
            t._id === typeId || 
            t.name === typeId || 
            t.name?.toLowerCase() === typeId?.toLowerCase()
        );
        
        const payload = {
            reimbursementTypeId: selectedType?._id || typeId,
            reimbursementType: (selectedType?.name || typeId || '').toLowerCase(),
            title,
            description,
            amount: parseFloat(amount),
            expenseDate: parseDateToISO(date),
            attachments: attachments.length > 0 
                ? attachments.map(att => ({
                    fileName: att.fileName || att.name || 'receipt',
                    fileUrl: att.fileUrl || att.uri || ''
                })) 
                : [],
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
            console.error("Reimbursement Submit Error: ", err);
            let errMsg = "An unknown error occurred.";
            
            // Try to extract the most useful error message
            if (err?.data?.error?.details?.[0]?.message) {
                errMsg = err.data.error.details[0].message;
            } else if (err?.data?.message) {
                errMsg = err.data.message;
            } else if (err?.data?.error?.message) {
                errMsg = err.data.error.message;
            } else if (err?.error) {
                errMsg = err.error;
            } else if (typeof err?.data === 'string') {
                errMsg = err.data;
            } else {
                errMsg = JSON.stringify(err?.data || err || {});
            }
            
            Alert.alert("Submission Error", errMsg);
        }
    };

    const reimbursementTypes = typesResp?.data || [];
    const selectedTypeObj = reimbursementTypes.find((t: any) => t._id === typeId || t.name === typeId);

    console.log('Rendering NewReimbursementModal, isVisible:', isVisible);

    if (!isVisible) return null;

    return (
        <View style={styles.modalOverlay} pointerEvents="auto">
            <View style={styles.modalCard}>
                    
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>Request Reimbursement</Text>
                        <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
                            <Text style={styles.closeIcon}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Content */}
                    <ScrollView style={styles.scrollArea} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
                        
                        <View style={styles.gridRow}>
                            <View style={styles.gridCol}>
                                <Text style={styles.label}>Title *</Text>
                                <TextInput 
                                    style={styles.input}
                                    placeholder="Business Lunch with..."
                                    placeholderTextColor="#94A3B8"
                                    value={title}
                                    onChangeText={setTitle}
                                />
                            </View>
                            <View style={[styles.gridCol, { zIndex: 10 }]}>
                                <Text style={styles.label}>Type *</Text>
                                <TouchableOpacity 
                                    style={styles.selectInput}
                                    onPress={() => setIsDropdownOpen(!isDropdownOpen)}
                                >
                                    <Text style={{color: selectedTypeObj ? '#1E293B' : '#94A3B8', fontSize: 14}}>
                                        {selectedTypeObj ? selectedTypeObj.name : 'Select Type'}
                                    </Text>
                                    <View style={styles.chevronIcon} />
                                </TouchableOpacity>
                                
                                {isDropdownOpen && (
                                    <View style={styles.dropdownMenu}>
                                        {reimbursementTypes.map((type: any) => (
                                            <TouchableOpacity 
                                                key={type._id}
                                                style={styles.dropdownOption}
                                                onPress={() => {
                                                    setTypeId(type._id);
                                                    setIsDropdownOpen(false);
                                                }}
                                            >
                                                <Text style={styles.dropdownOptionText}>{type.name}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                )}
                            </View>
                        </View>

                        <View style={[styles.gridRow, { zIndex: -1 }]}>
                            <View style={styles.gridCol}>
                                <Text style={styles.label}>Amount *</Text>
                                <TextInput 
                                    style={styles.input}
                                    placeholder="0.00"
                                    placeholderTextColor="#94A3B8"
                                    value={amount}
                                    onChangeText={setAmount}
                                    keyboardType="numeric"
                                />
                            </View>
                            <View style={styles.gridCol}>
                                <Text style={styles.label}>Expense Date *</Text>
                                <View style={styles.dateInputContainer}>
                                    <TextInput 
                                        style={[styles.input, { paddingRight: 40 }]}
                                        placeholder="DD-MM-YYYY"
                                        placeholderTextColor="#94A3B8"
                                        value={date}
                                        onChangeText={setDate}
                                    />
                                    <Text style={styles.calendarIcon}>📅</Text>
                                </View>
                            </View>
                        </View>

                        <View style={[styles.formGroup, { zIndex: -2 }]}>
                            <Text style={styles.label}>Description</Text>
                            <TextInput 
                                style={[styles.input, styles.textArea]}
                                placeholder="Provide more details about the expense..."
                                placeholderTextColor="#94A3B8"
                                multiline
                                textAlignVertical="top"
                                value={description}
                                onChangeText={setDescription}
                            />
                        </View>

                        <View style={[styles.formGroup, { zIndex: -3 }]}>
                            <Text style={styles.label}>Attachments (Images/PDF Max 1MB each)</Text>
                            <TouchableOpacity 
                                style={styles.uploadBtn}
                                onPress={handlePickDocument}
                            >
                                <Text style={styles.uploadIcon}>⬆</Text>
                                <Text style={styles.uploadText}>Add Receipts</Text>
                            </TouchableOpacity>
                            
                            {attachments.length > 0 && (
                                <View style={styles.attachmentList}>
                                    {attachments.map((file: any, index: number) => (
                                        <View key={index} style={styles.attachmentItem}>
                                            <Image 
                                                source={{ uri: file.fileUrl }} 
                                                style={styles.thumbnail}
                                                resizeMode="cover"
                                            />
                                            <View style={styles.attachmentInfo}>
                                                <Text style={styles.attachmentName} numberOfLines={1}>
                                                    {file.fileName || 'Receipt'}
                                                </Text>
                                                <Text style={styles.attachmentSize}>
                                                    {file.size ? (file.size / 1024).toFixed(1) + ' KB' : ''}
                                                </Text>
                                            </View>
                                            <TouchableOpacity 
                                                onPress={() => setAttachments(prev => prev.filter((_, i) => i !== index))}
                                                style={styles.removeBtn}
                                            >
                                                <Text style={styles.removeIcon}>✕</Text>
                                            </TouchableOpacity>
                                        </View>
                                    ))}
                                </View>
                            )}
                        </View>
                        
                    </ScrollView>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <TouchableOpacity style={styles.cancelBtn} onPress={handleClose} disabled={isCreating || isUpdating}>
                            <Text style={styles.cancelBtnText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={styles.submitBtn} 
                            onPress={handleSubmit}
                            disabled={isCreating || isUpdating}
                        >
                            {(isCreating || isUpdating) ? (
                                <ActivityIndicator color="#FFF" size="small" />
                            ) : (
                                <Text style={styles.submitBtnText}>Submit Request</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
    );
}

const _getStyles = (COLORS: any) => StyleSheet.create({
    modalOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
        zIndex: 99999,
    },
    modalCard: {
        width: '100%',
        maxWidth: 550,
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 10,
        maxHeight: '90%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 18,
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1E293B',
    },
    closeBtn: {
        padding: 4,
    },
    closeIcon: {
        fontSize: 20,
        color: '#64748B',
    },
    scrollArea: {
        flexShrink: 1,
    },
    contentContainer: {
        padding: 24,
    },
    gridRow: {
        flexDirection: 'row',
        marginHorizontal: -8,
        marginBottom: 20,
        zIndex: 1,
    },
    gridCol: {
        flex: 1,
        paddingHorizontal: 8,
    },
    formGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: '#334155',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 8,
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 12,
        height: 48,
        fontSize: 15,
        color: '#1E293B',
    },
    selectInput: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 8,
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 12,
        height: 48,
    },
    chevronIcon: {
        width: 0,
        height: 0,
        borderLeftWidth: 5,
        borderRightWidth: 5,
        borderTopWidth: 5,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderTopColor: '#64748B',
    },
    dropdownMenu: {
        position: 'absolute',
        top: 75,
        left: 8,
        right: 8,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 6,
        zIndex: 1000,
    },
    dropdownOption: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    dropdownOptionText: {
        fontSize: 14,
        color: '#1E293B',
    },
    dateInputContainer: {
        position: 'relative',
        justifyContent: 'center',
    },
    calendarIcon: {
        position: 'absolute',
        right: 12,
        fontSize: 16,
        color: '#1E293B',
    },
    textArea: {
        height: 100,
        paddingTop: 12,
    },
    uploadBtn: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        borderWidth: 1,
        borderColor: '#CBD5E1',
        borderStyle: 'dashed',
        borderRadius: 8,
        backgroundColor: '#FFFFFF',
        height: 54,
    },
    uploadIcon: {
        fontSize: 18,
        color: '#64748B',
    },
    uploadText: {
        fontSize: 14,
        color: '#64748B',
        fontWeight: '500',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 12,
        paddingHorizontal: 24,
        paddingVertical: 16,
        borderTopWidth: 1,
        borderTopColor: '#E2E8F0',
        backgroundColor: '#FCFCFD',
        borderBottomLeftRadius: 8,
        borderBottomRightRadius: 8,
    },
    cancelBtn: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 6,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#1D4ED8',
    },
    cancelBtnText: {
        color: '#1D4ED8',
        fontSize: 14,
        fontWeight: '500',
    },
    submitBtn: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 6,
        backgroundColor: '#1D4ED8',
        justifyContent: 'center',
        alignItems: 'center',
        minWidth: 120,
    },
    submitBtnText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '500',
    },
    attachmentList: { 
        marginTop: 15, 
        gap: 12 
    },
    attachmentItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        padding: 8,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    thumbnail: {
        width: 48,
        height: 48,
        borderRadius: 8,
        backgroundColor: '#E2E8F0',
    },
    attachmentInfo: {
        flex: 1,
        marginLeft: 12,
    },
    attachmentName: { 
        fontSize: 14, 
        fontWeight: '500',
        color: '#1E293B' 
    },
    attachmentSize: {
        fontSize: 12,
        color: '#64748B',
        marginTop: 2,
    },
    removeBtn: {
        padding: 8,
    },
    removeIcon: { 
        fontSize: 16, 
        color: '#EF4444' 
    },
});

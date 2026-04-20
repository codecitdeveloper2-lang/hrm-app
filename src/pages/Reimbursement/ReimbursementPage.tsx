import { useTheme } from '../../styles/ThemeProvider';
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useWindowDimensions, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { globalStyles } from '../../styles';
import StatCard from '../../components/dashboard/StatCard';
import { 
  useGetMyReimbursementsQuery, 
  useDeleteReimbursementMutation 
} from '../../store/api/apiSlice';
import { formatDate, formatCurrency } from '../../utils';
import NewReimbursementModal from '../../components/reimbursement/NewReimbursementModal';

export default function ReimbursementPage() {
  const { colors: THEME_COLORS } = useTheme();
  const styles = _getStyles(THEME_COLORS);
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRequest, setEditingRequest] = useState<any>(null);

  const { 
    data: reimbursementsResp, 
    isLoading: requestsLoading, 
    refetch: refetchRequests 
  } = useGetMyReimbursementsQuery(undefined);
  
  const [deleteReimbursement, { isLoading: isDeleting }] = useDeleteReimbursementMutation();

  const handleRefresh = () => {
    refetchRequests();
  };

  const handleDelete = (id: string) => {
      Alert.alert(
          "Cancel Request",
          "Are you sure you want to cancel this reimbursement request?",
          [
              { text: "No", style: "cancel" },
              { 
                text: "Yes, Cancel", 
                style: "destructive",
                onPress: async () => {
                   try {
                       await deleteReimbursement(id).unwrap();
                       Alert.alert("Success", "Request cancelled.");
                   } catch (err: any) {
                       Alert.alert("Error", err.data?.message || "Failed to cancel request.");
                   }
                }
              }
          ]
      );
  };

  const handleEdit = (request: any) => {
    setEditingRequest(request);
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setEditingRequest(null);
  };

  const handleNewRequest = () => {
    setEditingRequest(null);
    setIsModalVisible(true);
  };

  const requests = reimbursementsResp?.data || [];
  
  const stats = {
      total: requests.length,
      pending: requests.filter((r: any) => r.status === 'pending').length,
      approved: requests.filter((r: any) => r.status === 'approved').length,
      settledAmount: requests
          .filter((r: any) => r.status === 'approved')
          .reduce((sum: number, r: any) => sum + (r.amount || 0), 0),
  };

  const STAT_CARDS = [
    { title: 'Total Requests', value: stats.total.toString(), accentColor: '#3B82F6', icon: '📝' },
    { title: 'Pending', value: stats.pending.toString(), accentColor: '#F59E0B', icon: '⏳' },
    { title: 'Approved', value: stats.approved.toString(), accentColor: '#10B981', icon: '✅' },
    { title: 'Rejected', value: (stats.total - stats.pending - stats.approved).toString(), accentColor: '#EF4444', icon: '❌' },
  ];

  const getStatusStyle = (status: string) => {
      switch(status) {
          case 'pending': return { bg: THEME_COLORS.warning + '20', color: THEME_COLORS.warning, dot: THEME_COLORS.warning };
          case 'approved': return { bg: THEME_COLORS.success + '20', color: THEME_COLORS.success, dot: THEME_COLORS.success };
          case 'rejected': return { bg: THEME_COLORS.error + '20', color: THEME_COLORS.error, dot: THEME_COLORS.error };
          case 'cancelled': return { bg: THEME_COLORS.bgMid, color: THEME_COLORS.textMuted, dot: THEME_COLORS.textMuted };
          default: return { bg: THEME_COLORS.bgMid, color: THEME_COLORS.textSecondary, dot: THEME_COLORS.textSecondary };
      }
  };

  return (
    <View style={globalStyles.screenContainer}>
        <ScrollView 
            style={styles.container} 
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
            refreshControl={
                <RefreshControl refreshing={requestsLoading} onRefresh={handleRefresh} tintColor={THEME_COLORS.accent} />
            }
        >
        
        <View style={styles.topActions}>
            <TouchableOpacity style={styles.applyBtn} onPress={handleNewRequest}>
                <Text style={styles.applyBtnText}>+ New Request</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.refreshBtn} onPress={handleRefresh}>
                <Text style={styles.refreshIcon}>🔄</Text>
            </TouchableOpacity>
        </View>

        <View style={styles.heroBanner}>
            <View style={styles.heroContent}>
                <View style={styles.heroBadge}>
                    <Text style={styles.heroBadgeText}>💰 Expense Tracker</Text>
                </View>
                <Text style={styles.heroTitle}>Need a Refund?</Text>
                <Text style={styles.heroSubtitle}>
                    Submit your business expenses easily and track your claims in real-time.
                </Text>
            </View>
            <View style={styles.settledBox}>
                <View style={styles.settledIcon}>
                    <Text style={{fontSize: 20}}>💳</Text>
                </View>
                <View>
                    <Text style={styles.settledLabel}>TOTAL SETTLED</Text>
                    <Text style={styles.settledValue}>{formatCurrency(stats.settledAmount)}</Text>
                </View>
            </View>
        </View>

        <View style={styles.statsRow}>
            {STAT_CARDS.map((stat, index) => (
                <View key={index} style={{ width: isMobile ? '100%' : '48%', marginBottom: 12 }}>
                    <StatCard {...stat} />
                </View>
            ))}
        </View>

        <View style={styles.section}>
            <Text style={styles.sectionTitle}>My Claims</Text>
            <View style={styles.requestList}>
                {requests.map((request: any) => {
                    const statusStyle = getStatusStyle(request.status);
                    return (
                        <View key={request._id} style={styles.requestItem}>
                            <View style={styles.requestMain}>
                                <View style={styles.iconBox}>
                                    <Text style={styles.iconText}>🧾</Text>
                                </View>
                                <View style={{flex: 1}}>
                                    <Text style={styles.requestTitle}>{request.title}</Text>
                                    <Text style={styles.requestMeta}>
                                        {formatDate(request.expenseDate)} • {request.reimbursementType}
                                    </Text>
                                </View>
                                <View style={{alignItems: 'flex-end'}}>
                                    <Text style={styles.amountText}>{formatCurrency(request.amount)}</Text>
                                    <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                                        <Text style={[styles.statusDot, { color: statusStyle.dot }]}>●</Text>
                                        <Text style={[styles.statusText, { color: statusStyle.color }]}>
                                            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                            
                            {request.status === 'pending' && (
                                <View style={styles.actionsBar}>
                                    <TouchableOpacity style={styles.actionBtn} onPress={() => handleEdit(request)}>
                                        <Text style={styles.editBtnText}>Edit</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.actionBtn} onPress={() => handleDelete(request._id)}>
                                        <Text style={styles.deleteBtnText}>Cancel</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                            
                            {(request.status === 'rejected' && (request.rejectionReason || request.approval?.rejectionReason)) && (
                                <View style={styles.rejectionBox}>
                                    <Text style={styles.rejectionLabel}>Rejection Reason:</Text>
                                    <Text style={styles.rejectionText}>
                                        {request.rejectionReason || request.approval?.rejectionReason}
                                    </Text>
                                </View>
                            )}
                        </View>
                    );
                })}
                
                {requests.length === 0 && !requestsLoading && (
                    <View style={styles.emptyBox}>
                        <Text style={{fontSize: 50, marginBottom: 15}}>📑</Text>
                        <Text style={styles.emptyTitle}>No claims found</Text>
                        <Text style={styles.emptySubtitle}>You haven't submitted any reimbursement requests yet.</Text>
                        <TouchableOpacity style={styles.emptyBtn} onPress={handleNewRequest}>
                            <Text style={styles.emptyBtnText}>Create Claim</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </View>

        </ScrollView>

        <NewReimbursementModal 
            isVisible={isModalVisible}
            onClose={handleCloseModal}
            editingRequest={editingRequest}
        />
    </View>
  );
}

const _getStyles = (COLORS: any) => StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  topActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  refreshBtn: {
    backgroundColor: COLORS.cardBg,
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  refreshIcon: { fontSize: 16, color: COLORS.textPrimary },
  applyBtn: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  applyBtnText: { color: '#FFF', fontWeight: '700', fontSize: 13 },
  
  heroBanner: {
    backgroundColor: COLORS.accent,
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 8,
  },
  heroContent: { marginBottom: 20 },
  heroBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 12,
  },
  heroBadgeText: { color: '#FFF', fontSize: 10, fontWeight: '800' },
  heroTitle: { fontSize: 28, fontWeight: '800', color: '#FFF', marginBottom: 6 },
  heroSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.85)', lineHeight: 20 },
  
  settledBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  settledIcon: {
    width: 44,
    height: 44,
    backgroundColor: '#FFF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settledLabel: { fontSize: 10, color: 'rgba(255,255,255,0.7)', fontWeight: '800' },
  settledValue: { fontSize: 22, fontWeight: '800', color: '#FFF' },
  
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  
  section: { marginTop: 10 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 15 },
  requestList: { gap: 12 },
  
  requestItem: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 20,
    padding: 16,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  requestMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.inputBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: { fontSize: 20 },
  requestTitle: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary },
  requestMeta: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  amountText: { fontSize: 16, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 4 },
  
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  statusDot: { fontSize: 8 },
  statusText: { fontSize: 10, fontWeight: '700' },
  
  actionsBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 15,
    marginTop: 15,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.cardBorder,
  },
  actionBtn: { padding: 4 },
  editBtnText: { color: COLORS.accent, fontWeight: '700', fontSize: 13 },
  deleteBtnText: { color: COLORS.error, fontWeight: '700', fontSize: 13 },
  
  rejectionBox: {
    backgroundColor: COLORS.error + '10',
    padding: 12,
    borderRadius: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: COLORS.error + '20',
  },
  rejectionLabel: { fontSize: 11, fontWeight: '700', color: COLORS.error, marginBottom: 2 },
  rejectionText: { fontSize: 11, color: COLORS.textSecondary, lineHeight: 16 },
  
  emptyBox: {
    padding: 40,
    alignItems: 'center',
    backgroundColor: COLORS.cardBg,
    borderRadius: 24,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: COLORS.cardBorder,
  },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 8 },
  emptySubtitle: { fontSize: 13, color: COLORS.textSecondary, textAlign: 'center', marginBottom: 24 },
  emptyBtn: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyBtnText: { color: '#FFF', fontWeight: '700' },
});

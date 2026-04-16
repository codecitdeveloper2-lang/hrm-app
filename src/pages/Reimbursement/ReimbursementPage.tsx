import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useWindowDimensions, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { COLORS, globalStyles } from '../../styles';
import StatCard from '../../components/dashboard/StatCard';
import { 
  useGetMyReimbursementsQuery, 
  useGetReimbursementTypesQuery, 
  useDeleteReimbursementMutation 
} from '../../store/api/apiSlice';
import { formatDate, formatCurrency } from '../../utils';
import NewReimbursementModal from '../../components/reimbursement/NewReimbursementModal';

export default function ReimbursementPage() {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const isResponsive = width < 1024;

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRequest, setEditingRequest] = useState<any>(null);

  React.useEffect(() => {
    console.log('Modal Visibility Changed:', isModalVisible);
  }, [isModalVisible]);

  // Queries
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
    console.log('--- NEW REQUEST BUTTON CLICKED ---');
    if (__DEV__) {
      // Alert.alert("Debug", "New Request button clicked!");
    }
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
          .reduce((sum: number, r: any) => sum + r.amount, 0),
  };

  const STAT_CARDS = [
    { title: 'Total Requests', value: stats.total.toString(), accentColor: '#3B82F6', icon: '📝' },
    { title: 'Pending', value: stats.pending.toString(), accentColor: '#F59E0B', icon: '⏳' },
    { title: 'Approved', value: stats.approved.toString(), accentColor: '#10B981', icon: '✅' },
    { title: 'Rejected/Other', value: (stats.total - stats.pending - stats.approved).toString(), accentColor: '#EF4444', icon: '❌' },
  ];

  const getStatusStyle = (status: string) => {
      switch(status) {
          case 'pending': return { bg: '#FFFBEB', color: '#D97706', dot: '#F59E0B' };
          case 'approved': return { bg: '#F0FDF4', color: '#16A34A', dot: '#22C55E' };
          case 'rejected': return { bg: '#FEF2F2', color: '#DC2626', dot: '#EF4444' };
          case 'cancelled': return { bg: '#F8FAFC', color: '#64748B', dot: '#94A3B8' };
          default: return { bg: '#F1F5F9', color: '#475569', dot: '#64748B' };
      }
  };

  return (
    <View style={globalStyles.screenContainer}>
        <ScrollView 
            style={styles.container} 
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
            refreshControl={
                <RefreshControl refreshing={requestsLoading} onRefresh={handleRefresh} tintColor={COLORS.accent} />
            }
        >
        
        {/* Top Actions */}
        <View style={styles.topActions}>
            <TouchableOpacity style={styles.applyBtn} onPress={handleNewRequest}>
                <Text style={styles.applyBtnText}>+ New Request</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.refreshBtn} onPress={handleRefresh}>
                <Text style={styles.refreshIcon}>🔄</Text>
            </TouchableOpacity>
        </View>

        {/* Hero Section */}
        <View style={styles.heroBanner}>
            <View style={styles.heroContent}>
                <View style={styles.heroBadge}>
                    <Text style={styles.heroBadgeText}>💰 Expense Tracker</Text>
                </View>
                <Text style={styles.heroTitle}>Need a Refund?</Text>
                <Text style={styles.heroSubtitle}>
                    Submit your business expenses easily and track your reimbursement claims in real-time.
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

        {/* Stats Grid */}
        <View style={styles.statsRow}>
            {STAT_CARDS.map((stat, index) => (
                <View key={index} style={{ width: isMobile ? '100%' : '48%', marginBottom: 12 }}>
                    <StatCard {...stat} />
                </View>
            ))}
        </View>

        {/* Request List Section */}
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>My Requests</Text>
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
                                    <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg, borderColor: statusStyle.bg }]}>
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
                        <Text style={styles.emptyTitle}>No requests found</Text>
                        <Text style={styles.emptySubtitle}>You haven't submitted any reimbursement requests yet.</Text>
                        <TouchableOpacity style={styles.emptyBtn} onPress={handleNewRequest}>
                            <Text style={styles.emptyBtnText}>Create Request</Text>
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

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  topActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  refreshBtn: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  refreshIcon: { fontSize: 16 },
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
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#FFF', marginBottom: 15 },
  requestList: { gap: 12 },
  
  requestItem: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 4,
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
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: { fontSize: 20 },
  requestTitle: { fontSize: 15, fontWeight: '700', color: '#1E293B' },
  requestMeta: { fontSize: 12, color: '#64748B', marginTop: 2 },
  amountText: { fontSize: 16, fontWeight: '800', color: '#1E293B', marginBottom: 4 },
  
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
    borderTopColor: '#F1F5F9',
  },
  actionBtn: { padding: 4 },
  editBtnText: { color: COLORS.accent, fontWeight: '700', fontSize: 13 },
  deleteBtnText: { color: COLORS.error, fontWeight: '700', fontSize: 13 },
  
  rejectionBox: {
    backgroundColor: '#FEF2F2',
    padding: 12,
    borderRadius: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  rejectionLabel: { fontSize: 11, fontWeight: '700', color: '#B91C1C', marginBottom: 2 },
  rejectionText: { fontSize: 11, color: '#7F1D1D', lineHeight: 16 },
  
  emptyBox: {
    padding: 40,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: 24,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(255,255,255,0.1)',
  },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#FFF', marginBottom: 8 },
  emptySubtitle: { fontSize: 13, color: '#94A3B8', textAlign: 'center', marginBottom: 24 },
  emptyBtn: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyBtnText: { color: '#FFF', fontWeight: '700' },
});

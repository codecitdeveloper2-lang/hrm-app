import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  useWindowDimensions, 
  ActivityIndicator, 
  Alert, 
  RefreshControl 
} from 'react-native';
import { COLORS, globalStyles } from '../../styles';
import StatCard from '../../components/dashboard/StatCard';
import { 
  useGetMyStatsQuery, 
  useGetMyBalanceQuery, 
  useGetMyLeavesQuery,
  useGetLeaveTypesQuery,
  useCancelLeaveMutation 
} from '../../store/api/apiSlice';
import ApplyLeaveModal from '../../components/leave/ApplyLeaveModal';

/**
 * LeavePage - Optimized for Mobile with 100% logic parity to web CRM
 */
export default function LeavePage() {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'cancelled'>('all');
  const [isModalVisible, setIsModalVisible] = useState(false);

  // API Hooks
  const { data: statsResp, isLoading: statsLoading, refetch: refetchStats } = useGetMyStatsQuery(undefined);
  const { data: balanceResp, isLoading: balanceLoading, refetch: refetchBalance } = useGetMyBalanceQuery(undefined);
  const { data: leavesResp, isLoading: leavesLoading, refetch: refetchLeaves } = useGetMyLeavesQuery(
    statusFilter === 'all' ? undefined : { status: statusFilter }
  );
  const { data: leaveTypesResp } = useGetLeaveTypesQuery(undefined);
  const [cancelLeave, { isLoading: isCancelling }] = useCancelLeaveMutation();

  const handleRefresh = () => {
    refetchStats();
    refetchBalance();
    refetchLeaves();
  };

  const handleCancelLeave = (id: string) => {
    Alert.alert(
      "Cancel Leave",
      "Are you sure you want to cancel this leave request?",
      [
        { text: "No", style: "cancel" },
        { 
          text: "Yes, Cancel", 
          style: "destructive",
          onPress: async () => {
            try {
              await cancelLeave(id).unwrap();
              Alert.alert("Success", "Leave request cancelled.");
            } catch (err: any) {
              const msg = err.data?.error?.message || err.data?.message || "Action failed.";
              Alert.alert("Error", msg);
            }
          }
        }
      ]
    );
  };

  // Helper variables
  const stats = statsResp?.data?.summary || { available: 0, used: 0, pending: 0, totalAllocated: 0 };
  const balances = balanceResp?.data?.balances || [];
  const requests = leavesResp?.data || [];

  const getLeaveTypeConfig = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('annual')) return { icon: '🏖️', color: '#3B82F6' };
    if (n.includes('sick')) return { icon: '🤒', color: '#EF4444' };
    if (n.includes('casual') || n.includes('personal')) return { icon: '👤', color: '#F59E0B' };
    if (n.includes('maternity') || n.includes('paternity')) return { icon: '👶', color: '#10B981' };
    if (n.includes('unpaid') || n.includes('lwp')) return { icon: '🚫', color: '#64748B' };
    return { icon: '📄', color: '#6C63FF' };
  };

  return (
    <View style={globalStyles.screenContainer}>
        {/* Floating Action Button for Apply Leave (Optional, but let's keep it in the flow for now) */}
        
        <ScrollView 
            style={styles.container} 
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
            refreshControl={
                <RefreshControl refreshing={statsLoading || balanceLoading || leavesLoading} onRefresh={handleRefresh} tintColor="#6C63FF" />
            }
        >
            {/* Minimalist Top Actions - No redundant header */}
            <View style={styles.topActions}>
                <TouchableOpacity style={styles.applyBtn} onPress={() => setIsModalVisible(true)}>
                    <Text style={styles.applyBtnText}>+ Apply Leave</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.refreshBtn} onPress={handleRefresh}>
                    <Text style={styles.refreshIcon}>🔄</Text>
                </TouchableOpacity>
            </View>

            {/* Hero Portal Banner (Matches Web) */}
            <View style={styles.heroBanner}>
                <View style={styles.heroContent}>
                    <View style={styles.heroBadge}>
                        <Text style={styles.heroBadgeText}>✈ PORTAL</Text>
                    </View>
                    <Text style={styles.heroTitle}>Plan Your Break</Text>
                    <Text style={styles.heroSubtitle}>
                        Check your balance and apply for time off in just a few clicks.
                    </Text>
                </View>
                <Text style={styles.heroDecoration}>✈️</Text>
            </View>

            {/* Key Performance Indicators */}
            <View style={styles.statsRow}>
                <View style={styles.statCol}>
                    <StatCard title="Available" value={stats.available} accentColor="#3B82F6" icon="🏖️" />
                </View>
                <View style={styles.statCol}>
                    <StatCard title="Approved" value={stats.used} accentColor="#10B981" icon="✅" />
                </View>
                <View style={styles.statCol}>
                    <StatCard title="Pending" value={stats.pending} accentColor="#F59E0B" icon="⏳" />
                </View>
                <View style={styles.statCol}>
                    <StatCard title="Total" value={stats.totalAllocated} accentColor="#8B5CF6" icon="💼" />
                </View>
            </View>

            {/* Balance Details List */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Balance Details</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.balanceList}>
                    {balances.map((b: any) => {
                        const config = getLeaveTypeConfig(b.name);
                        return (
                            <View key={b.code} style={styles.breakdownCard}>
                                <View style={styles.breakdownHeader}>
                                    <View style={[styles.typeIconBox, { backgroundColor: config.color + '20' }]}>
                                        <Text style={styles.typeIconText}>{config.icon}</Text>
                                    </View>
                                    <Text style={styles.leaveTypeName} numberOfLines={1}>{b.name}</Text>
                                </View>
                                <View style={styles.breakdownStats}>
                                    <View>
                                        <Text style={styles.breakdownLabel}>Available</Text>
                                        <Text style={styles.breakdownValue}>{b.isPaid === false ? '∞' : b.currentBalance}</Text>
                                    </View>
                                    <View style={{alignItems: 'flex-end'}}>
                                        <Text style={styles.breakdownLabel}>Used: {b.used}</Text>
                                        <Text style={styles.breakdownLabel}>Alloc: {b.totalAllocated || '-'}</Text>
                                    </View>
                                </View>
                                {b.isPaid !== false && (
                                    <View style={styles.progressBar}>
                                        <View style={[styles.progressFill, { 
                                            width: `${Math.min(100, ((b.used || 0) / (b.totalAllocated || 1)) * 100)}%`,
                                            backgroundColor: config.color 
                                        }]} />
                                    </View>
                                )}
                            </View>
                        );
                    })}
                    {balances.length === 0 && !balanceLoading && (
                        <Text style={styles.emptyText}>No balance data found.</Text>
                    )}
                </ScrollView>
            </View>

            {/* Application History */}
            <View style={styles.section}>
                <View style={styles.rowBetween}>
                    <Text style={styles.sectionTitle}>History</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterBar}>
                        {['all', 'pending', 'approved', 'rejected', 'cancelled'].map((f) => (
                            <TouchableOpacity 
                                key={f} 
                                style={[styles.filterChip, statusFilter === f && styles.filterChipActive]}
                                onPress={() => setStatusFilter(f as any)}
                            >
                                <Text style={[styles.filterChipText, statusFilter === f && styles.filterChipTextActive]}>
                                    {f.charAt(0).toUpperCase() + f.slice(1)}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
                
                <View style={styles.requestList}>
                    {requests.map((request: any) => {
                        const isPending = request.status === 'pending';
                        const statusColors: any = {
                            pending: { bg: '#FFFBEB', text: '#D97706', dot: '#F59E0B' },
                            approved: { bg: '#F0FDF4', text: '#16A34A', dot: '#22C55E' },
                            rejected: { bg: '#FEF2F2', text: '#DC2626', dot: '#EF4444' },
                            cancelled: { bg: '#F8FAFC', text: '#64748B', dot: '#94A3B8' }
                        };
                        const conf = statusColors[request.status] || statusColors.cancelled;
                        
                        return (
                            <View key={request._id} style={styles.requestItem}>
                                <View style={styles.requestItemLeft}>
                                    <View style={styles.requestIconCircle}>
                                        <Text style={styles.requestItemIcon}>📄</Text>
                                    </View>
                                    <View style={{flex: 1}}>
                                        <Text style={styles.requestItemType}>{request.leaveType}</Text>
                                        <Text style={styles.requestItemMeta}>
                                            {request.numberOfDays} days  •  {new Date(request.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </Text>
                                        <Text style={styles.requestItemReason} numberOfLines={1}>{request.reason}</Text>
                                    </View>
                                </View>
                                <View style={styles.requestItemRight}>
                                    <View style={[styles.statusTag, { backgroundColor: conf.bg, borderColor: conf.dot + '20' }]}>
                                        <View style={[styles.statusPoint, { backgroundColor: conf.dot }]} />
                                        <Text style={[styles.statusTagText, { color: conf.text }]}>{request.status.toUpperCase()}</Text>
                                    </View>
                                    {isPending && (
                                        <TouchableOpacity onPress={() => handleCancelLeave(request._id)} disabled={isCancelling}>
                                            <Text style={styles.cancelLink}>Cancel</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </View>
                        );
                    })}
                    {requests.length === 0 && !leavesLoading && (
                        <View style={styles.emptyStateContainer}>
                            <Text style={styles.emptyText}>No requests match this filter.</Text>
                        </View>
                    )}
                </View>
            </View>

            {/* Quick Policies View */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Leave Policies</Text>
                {leaveTypesResp?.data?.slice(0, 4).map((type: any) => (
                    <View key={type._id} style={styles.policyRow}>
                        <View style={styles.policyBullet} />
                        <View>
                            <Text style={styles.policyName}>{type.name}</Text>
                            <Text style={styles.policyMeta}>{type.daysPerYear} days yearly • Carry Forward: {type.maxCarryForward || 0}</Text>
                        </View>
                    </View>
                ))}
            </View>

        </ScrollView>
        
        <ApplyLeaveModal 
            isVisible={isModalVisible} 
            onClose={() => setIsModalVisible(false)} 
        />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 24, paddingBottom: 80 },
  
  topActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  applyBtn: {
    backgroundColor: '#6C63FF', // Static purple to avoid caching/theme issues
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: 18,
    shadowColor: '#6C63FF',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  applyBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 14 },
  refreshBtn: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    width: 48,
    height: 48,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  refreshIcon: { fontSize: 20 },

  heroBanner: {
    backgroundColor: '#6C63FF',
    borderRadius: 28,
    padding: 24,
    marginBottom: 28,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  heroContent: { flex: 1, zIndex: 1 },
  heroBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 12,
  },
  heroBadgeText: { color: '#FFF', fontSize: 10, fontWeight: '800' },
  heroTitle: { fontSize: 28, fontWeight: '800', color: '#FFF', marginBottom: 8 },
  heroSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.8)', lineHeight: 18, maxWidth: '90%' },
  heroDecoration: {
    position: 'absolute',
    right: -20,
    bottom: -10,
    fontSize: 120,
    opacity: 0.12,
    transform: [{ rotate: '-15deg' }],
  },

  statsRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 12 },
  statCol: { width: '48%', marginBottom: 14 },
  
  section: { marginVertical: 18 },
  sectionTitle: { fontSize: 20, fontWeight: '800', color: '#FFFFFF', marginBottom: 16 },
  balanceList: { paddingRight: 24, gap: 14 },
  breakdownCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    width: 220,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 4,
  },
  breakdownHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 18 },
  typeIconBox: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  typeIconText: { fontSize: 20 },
  leaveTypeName: { fontSize: 15, fontWeight: '700', color: '#1E293B', flex: 1 },
  breakdownStats: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  breakdownLabel: { fontSize: 11, color: '#94A3B8', fontWeight: '600' },
  breakdownValue: { fontSize: 20, fontWeight: '800', color: '#1E293B' },
  progressBar: { height: 8, backgroundColor: '#F1F5F9', borderRadius: 4, marginTop: 18, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },

  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  filterBar: { marginLeft: 10 },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  filterChipActive: { backgroundColor: '#6C63FF', borderColor: '#6C63FF' },
  filterChipText: { color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: '700' },
  filterChipTextActive: { color: '#FFFFFF' },

  requestList: { gap: 14 },
  requestItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  requestItemLeft: { flexDirection: 'row', gap: 14, flex: 1 },
  requestIconCircle: { width: 48, height: 48, borderRadius: 14, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' },
  requestItemIcon: { fontSize: 22 },
  requestItemType: { fontSize: 16, fontWeight: '700', color: '#1E293B' },
  requestItemMeta: { fontSize: 13, color: '#64748B', marginTop: 3 },
  requestItemReason: { fontSize: 11, color: '#94A3B8', marginTop: 5 },
  requestItemRight: { alignItems: 'flex-end', gap: 10 },
  statusTag: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, borderWidth: 1 },
  statusPoint: { width: 6, height: 6, borderRadius: 3 },
  statusTagText: { fontSize: 10, fontWeight: '800' },
  cancelLink: { color: COLORS.error, fontSize: 12, fontWeight: '700' },
  emptyStateContainer: { padding: 40, alignItems: 'center' },
  emptyText: { color: 'rgba(255,255,255,0.5)', fontSize: 14 },

  policyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 16,
    backgroundColor: 'rgba(255,255,255,0.04)',
    padding: 16,
    borderRadius: 18,
  },
  policyBullet: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#6C63FF' },
  policyName: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
  policyMeta: { fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 2 },
});

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
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);

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
            <View style={[styles.section, styles.historyContainer]}>
                <View style={[styles.historyHeader, { zIndex: 10 }]}>
                    <Text style={styles.historyTitle}>My Requests</Text>
                    <View style={styles.dropdownContainer}>
                        <TouchableOpacity 
                            style={styles.dropdownButton}
                            onPress={() => setIsDropdownVisible(!isDropdownVisible)}
                        >
                            <Text style={styles.dropdownButtonIcon}>▽</Text>
                            <Text style={styles.dropdownButtonText}>
                                {statusFilter === 'all' ? 'All Status' : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
                            </Text>
                            <Text style={styles.dropdownButtonIconArrow}>^</Text>
                        </TouchableOpacity>
                        
                        {isDropdownVisible && (
                            <View style={styles.dropdownMenu}>
                                {['all', 'pending', 'approved', 'rejected', 'cancelled'].map((f) => (
                                    <TouchableOpacity 
                                        key={f} 
                                        style={[styles.dropdownMenuItem, statusFilter === f && styles.dropdownMenuItemActive]}
                                        onPress={() => {
                                            setStatusFilter(f as any);
                                            setIsDropdownVisible(false);
                                        }}
                                    >
                                        <Text style={[styles.dropdownMenuItemText, statusFilter === f && styles.dropdownMenuItemTextActive]}>
                                            {f === 'all' ? 'All Status' : f.charAt(0).toUpperCase() + f.slice(1)}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                    </View>
                </View>
                
                <ScrollView style={{ maxHeight: 310 }} nestedScrollEnabled showsVerticalScrollIndicator={true}>
                    <View style={styles.requestListBlock}>
                        {requests.map((request: any) => {
                            const isPending = request.status === 'pending';
                            const statusColors: any = {
                                pending: { bg: '#FFFBEB', text: '#D97706', icon: '⏳' },
                                approved: { bg: '#F0FDF4', text: '#16A34A', icon: '✓' },
                                rejected: { bg: '#FEF2F2', text: '#DC2626', icon: '✕' },
                                cancelled: { bg: '#F1F5F9', text: '#64748B', icon: '⃠' }
                            };
                            const conf = statusColors[request.status] || statusColors.cancelled;
                            
                            return (
                                <View key={request._id} style={styles.requestCard}>
                                    <View style={styles.requestCardLeft}>
                                        <View style={styles.requestCardIconBox}>
                                            <Text style={styles.requestCardIcon}>📄</Text>
                                        </View>
                                        <View style={{flex: 1}}>
                                            <Text style={styles.requestCardType}>{request.leaveType || 'Leave'}</Text>
                                            <Text style={styles.requestCardMeta}>
                                                {request.numberOfDays} day{request.numberOfDays > 1 ? 's' : ''}  •  {new Date(request.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </Text>
                                            <Text style={styles.requestCardReason} numberOfLines={1}>{request.reason || request.leaveType}</Text>
                                        </View>
                                    </View>
                                    <View style={styles.requestCardRight}>
                                        <View style={[styles.statusPill, { backgroundColor: conf.bg }]}>
                                            <Text style={[styles.statusPillText, { color: conf.text }]}>{conf.icon}  {request.status.charAt(0).toUpperCase() + request.status.slice(1)}</Text>
                                        </View>
                                        {isPending && (
                                            <TouchableOpacity onPress={() => handleCancelLeave(request._id)} disabled={isCancelling} style={styles.cancelActionBtn}>
                                                <Text style={styles.cancelActionLink}>Cancel</Text>
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                </View>
                            );
                        })}
                        {requests.length === 0 && !leavesLoading && (
                            <View style={styles.emptyStateContainerBlock}>
                                <Text style={styles.emptyTextBlock}>No requests found.</Text>
                            </View>
                        )}
                    </View>
                </ScrollView>
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
  emptyText: { color: 'rgba(255,255,255,0.5)', fontSize: 14 },

  historyContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  dropdownContainer: {
    position: 'relative',
    zIndex: 100,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#3B82F6',
    gap: 8,
  },
  dropdownButtonIcon: { color: '#3B82F6', fontSize: 13, marginTop: -2 },
  dropdownButtonIconArrow: { color: '#3B82F6', fontSize: 13, marginLeft: 2, fontWeight: '700' },
  dropdownButtonText: {
    color: '#3B82F6',
    fontSize: 13,
    fontWeight: '600',
  },
  dropdownMenu: {
    position: 'absolute',
    top: 40,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingVertical: 8,
    width: 140,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  dropdownMenuItem: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  dropdownMenuItemActive: {
    backgroundColor: '#F0F5FF',
  },
  dropdownMenuItemText: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '500',
  },
  dropdownMenuItemTextActive: {
    color: '#3B82F6',
    fontWeight: '600',
  },
  requestListBlock: { gap: 12 },
  requestCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  requestCardLeft: { flexDirection: 'row', gap: 14, flex: 1 },
  requestCardIconBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  requestCardIcon: { fontSize: 20 },
  requestCardType: { fontSize: 15, fontWeight: '700', color: '#1E293B', marginBottom: 2 },
  requestCardMeta: { fontSize: 12, color: '#64748B', marginBottom: 4 },
  requestCardReason: { fontSize: 12, color: '#94A3B8' },
  requestCardRight: { alignItems: 'flex-end', gap: 10 },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusPillText: { fontSize: 11, fontWeight: '600' },
  cancelActionBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  cancelActionLink: { color: COLORS.error, fontSize: 12, fontWeight: '600' },
  emptyStateContainerBlock: { padding: 40, alignItems: 'center' },
  emptyTextBlock: { color: '#94A3B8', fontSize: 14 },

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

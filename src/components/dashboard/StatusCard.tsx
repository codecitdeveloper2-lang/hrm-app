import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, Platform, useWindowDimensions} from 'react-native';
import { 
  useGetClockInStatusQuery, 
  useClockInMutation, 
  useClockOutMutation,
  useBreakStartMutation,
  useBreakResumeMutation,
  useCheckCorrectionQuery
} from '../../store/api/apiSlice';

export default function StatusCard() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const { width } = useWindowDimensions();
  const isMobile = width < 700;

  const { data: statusData, isLoading: initialLoading } = useGetClockInStatusQuery(undefined);
  const [clockIn, { isLoading: isClockingInLoading }] = useClockInMutation();
  const [clockOut, { isLoading: isClockingOutLoading }] = useClockOutMutation();
  const [breakStart, { isLoading: isBreakingStartLoading }] = useBreakStartMutation();
  const [breakResume, { isLoading: isResumingLoading }] = useBreakResumeMutation();
  const { data: correctionData } = useCheckCorrectionQuery(undefined, { pollingInterval: 60000 });

  const d = statusData?.data;
  const isClockedIn = d?.isClockedIn ?? false;
  const isOnBreak = d?.isOnBreak ?? (d?.breaks?.length > 0 && !d.breaks[d.breaks.length - 1].endTime);
  const loading = isClockingInLoading || isClockingOutLoading || isBreakingStartLoading || isResumingLoading;
  const requiresCorrection = 
    isClockedIn &&
    correctionData?.success && 
    correctionData?.data?.requiresLogoutCorrection && 
    (correctionData?.data?.shiftId || correctionData?.data?.incompleteShift?.shiftId) &&
    (correctionData?.data?.loginTime || correctionData?.data?.incompleteShift?.loginTime);
  const [displayDuration, setDisplayDuration] = useState('00:00:00');

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);
      
      if (isClockedIn && d?.currentSession?.checkIn?.time && !isOnBreak) {
        const start = new Date(d.currentSession.checkIn.time).getTime();
        const diff = Math.floor((now.getTime() - start) / 1000);
        
        const hours = Math.floor(diff / 3600);
        const minutes = Math.floor((diff % 3600) / 60);
        const seconds = diff % 60;
        
        setDisplayDuration(
          `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        );
      } else if (isOnBreak || !isClockedIn) {
        setDisplayDuration(d?.currentSession?.durationString || '00:00:00');
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [isClockedIn, d?.currentSession, isOnBreak]);

  const checkInTime = d?.currentSession?.checkIn?.time
    ? new Date(d.currentSession.checkIn.time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
    : null;

  const formatCurrentTime = (date: Date) =>
    date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

  const handleClockIn = async () => {
    try {
      const deviceInfo = `${Platform.OS} ${Platform.Version || ''}`.trim() || 'Mobile App';
      await clockIn({ deviceInfo, remarks: 'Clocked in via mobile app' }).unwrap();
    } catch (error: any) {
      Alert.alert('Error', error.data?.message || 'Clock-in failed. Please try again.');
    }
  };

  const handleClockOut = async () => {
    try {
      const deviceInfo = `${Platform.OS} ${Platform.Version || ''}`.trim() || 'Mobile App';
      await clockOut({ deviceInfo }).unwrap();
    } catch (error: any) {
      Alert.alert('Error', error.data?.message || 'Clock-out failed. Please try again.');
    }
  };

  const handleBreakStart = async () => {
    try {
      const deviceInfo = `${Platform.OS} ${Platform.Version || ''}`.trim() || 'Mobile App';
      await breakStart({ deviceInfo }).unwrap();
    } catch (error: any) {
      Alert.alert('Error', error.data?.message || 'Failed to start break.');
    }
  };

  const handleResumeWork = async () => {
    try {
      const deviceInfo = `${Platform.OS} ${Platform.Version || ''}`.trim() || 'Mobile App';
      await breakResume({ deviceInfo }).unwrap();
    } catch (error: any) {
      Alert.alert('Error', error.data?.message || 'Failed to resume work.');
    }
  };

  if (initialLoading) {
    return (
      <View style={[styles.card, styles.loadingCard]}>
        <ActivityIndicator color="#FFFFFF" size="large" />
      </View>
    );
  }

  if (!isClockedIn) {
    return (
      <View style={[styles.card, styles.cardInactive, isMobile && styles.cardMobile]}>
        <View style={styles.inactiveContent}>
          <Text style={styles.sessionLabel}>NOT CLOCKED IN</Text>
          <Text style={styles.inactiveTime}>{formatCurrentTime(currentTime)}</Text>
        </View>
        <TouchableOpacity
          style={[styles.clockInBtn, isMobile && styles.clockInBtnMobile]}
          onPress={handleClockIn}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading
            ? <ActivityIndicator color="#2D5CFF" size="small" />
            : <Text style={styles.clockInBtnText}>→ Clock In</Text>
          }
        </TouchableOpacity>
      </View>
    );
  }

  // Clocked-in layout — DESKTOP: row, MOBILE: column
  return (
    <View style={styles.container}>
      {requiresCorrection && (
        <View style={styles.correctionBanner}>
          <Text style={styles.correctionTitle}>⚠️ Incomplete Shift Detected</Text>
          <Text style={styles.correctionText}>
            You didn't clock out for your shift on {new Date(correctionData.data.shiftDate).toLocaleDateString()}. Please submit a logout correction.
          </Text>
          <TouchableOpacity style={styles.correctionAction} activeOpacity={0.7}>
            <Text style={styles.correctionActionText}>Fix Now →</Text>
          </TouchableOpacity>
        </View>
      )}
      
      <View style={[styles.card, isMobile && styles.cardMobile]}>
        {/* Session info */}
        <View style={[styles.sessionInfo, isMobile && styles.sessionInfoMobile]}>
          
          {/* NEW: Current Status Badge */}
          <View style={styles.currentStatusWrapper}>
            <View style={[styles.statusIconCircle, isOnBreak ? {backgroundColor: '#F59E0B'} : (isClockedIn && {backgroundColor: '#10B981'})]}>
              <Text style={styles.statusIconCheck}>{isOnBreak ? '☕' : '✓'}</Text>
            </View>
            <View>
              <Text style={styles.currentStatusLabel}>Current Status</Text>
              <Text style={styles.currentStatusValue}>{isOnBreak ? 'On Break' : (isClockedIn ? 'Clocked In' : 'Clocked Out')}</Text>
            </View>
          </View>

          <Text style={styles.sessionLabel}>SESSION DURATION</Text>
          <Text style={[styles.sessionDuration, isMobile && styles.sessionDurationMobile]}>
            {displayDuration}
          </Text>
          <Text style={styles.sessionMeta}>
            {checkInTime ? `Started at ${checkInTime}  •  ` : ''}
            Current: {formatCurrentTime(currentTime)}
          </Text>
        </View>

        {/* Action buttons */}
        <View style={[styles.actions, isMobile && styles.actionsMobile]}>
          <TouchableOpacity
            style={[styles.breakBtn, isMobile && styles.breakBtnMobile, isOnBreak && styles.breakBtnActive]}
            onPress={isOnBreak ? handleResumeWork : handleBreakStart}
            activeOpacity={0.85}
            disabled={loading}
          >
            {loading && (isBreakingStartLoading || isResumingLoading) ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <Text style={styles.breakBtnIcon}>{isOnBreak ? '▶' : '⏸'}</Text>
                <Text style={styles.breakBtnText}>{isOnBreak ? 'Resume Work' : 'Start Break'}</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.clockOutBtn, isMobile && styles.clockOutBtnMobile]}
            onPress={handleClockOut}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading
              ? <ActivityIndicator color="#FFFFFF" size="small" />
              : <>
                  <Text style={styles.clockOutIcon}>→</Text>
                  <Text style={styles.clockOutText}>Clock Out</Text>
                </>
            }
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#2D5CFF',
    borderRadius: 16,
    paddingVertical: 28,
    paddingHorizontal: 28,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#2D5CFF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  cardMobile: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    paddingVertical: 22,
    paddingHorizontal: 20,
  },
  cardInactive: {
    backgroundColor: '#3B4A6B',
    shadowColor: '#000',
  },
  loadingCard: {
    justifyContent: 'center',
    minHeight: 100,
    alignItems: 'center',
  },

  // Session info
  sessionInfo: {
    flex: 1,
    marginRight: 16,
  },
  sessionInfoMobile: {
    flex: 0,
    marginRight: 0,
    width: '100%',
    marginBottom: 20,
  },
  currentStatusWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  statusIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  statusIconCheck: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
  currentStatusLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  currentStatusValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  sessionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.65)',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  sessionDuration: {
    fontSize: 42,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -1,
    lineHeight: 50,
    marginBottom: 8,
  },
  sessionDurationMobile: {
    fontSize: 36,
    lineHeight: 42,
  },
  sessionMeta: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '500',
  },

  // Inactive
  inactiveContent: {
    flex: 1,
    marginBottom: 0,
  },
  inactiveTime: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 4,
  },

  // Buttons
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  actionsMobile: {
    width: '100%',
    justifyContent: 'flex-start',
  },
  breakBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    gap: 6,
  },
  breakBtnActive: {
    backgroundColor: '#F59E0B',
    borderColor: '#D97706',
  },
  breakBtnMobile: {
    flex: 1,
    justifyContent: 'center',
  },
  breakBtnIcon: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  breakBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  clockOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EF4444',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
    gap: 6,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  clockOutBtnMobile: {
    flex: 1,
    justifyContent: 'center',
  },
  clockOutIcon: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  clockOutText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  clockInBtn: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 10,
    marginTop: 4,
  },
  clockInBtnMobile: {
    alignSelf: 'stretch',
    alignItems: 'center',
    marginTop: 16,
  },
  clockInBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2D5CFF',
  },
  // Correction banner
  correctionBanner: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#EF4444',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  correctionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#991B1B',
    marginBottom: 4,
  },
  correctionText: {
    fontSize: 13,
    color: '#B91C1C',
    lineHeight: 18,
    marginBottom: 12,
  },
  correctionAction: {
    backgroundColor: '#EF4444',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  correctionActionText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});

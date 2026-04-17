import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import {COLORS, globalStyles} from './styles';
import LoginScreen from './pages/Login';
import DashboardPage from './pages/Dashboard';
import UsersPage from './pages/Users';
import AttendancePage from './pages/Attendance';
import SchedulePage from './pages/Schedule';
import LeavePage from './pages/Leave';
import ProfilePage from './pages/Profile';
import ReimbursementPage from './pages/Reimbursement';
import DashboardLayout from './components/layout/DashboardLayout';
import MainLayout from './components/layout/MainLayout';

const {width} = Dimensions.get('window');

const NAV_ITEMS = [
  {key: 'Dashboard', label: 'Dashboard', icon: '📊'},
  {key: 'Users', label: 'Users', icon: '👥'},
  {key: 'Attendance', label: 'Attendance', icon: '✅'},
  {key: 'Schedule', label: 'Schedule', icon: '📅'},
  {key: 'Leave', label: 'Leave', icon: '✉️'},
  {key: 'Reimbursements', label: 'Reimbursements', icon: '💳'},
  {key: 'Profile', label: 'Profile', icon: '👤'},
];

import { useCheckCorrectionQuery } from './store/api/apiSlice';
import CorrectionModal from './components/attendance/CorrectionModal';

import {useAppSelector, useAppDispatch} from './store';

function AppContent() {
  const {isAuthenticated} = useAppSelector(state => state.auth);
  const [currentPage, setCurrentPage] = useState('Dashboard');
  const { data: correctionData } = useCheckCorrectionQuery(undefined, {
    skip: !isAuthenticated,
    pollingInterval: 60000,
  });

  const requiresCorrection = 
    correctionData?.success && 
    correctionData?.data?.requiresLogoutCorrection && 
    (correctionData?.data?.shiftId || correctionData?.data?.incompleteShift?.shiftId) &&
    (correctionData?.data?.loginTime || correctionData?.data?.incompleteShift?.loginTime);

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'Dashboard': return <DashboardPage />;
      case 'Users': return <UsersPage />;
      case 'Attendance': return <AttendancePage />;
      case 'Schedule': return <SchedulePage />;
      case 'Leave': return <LeavePage />;
      case 'Reimbursements': return <ReimbursementPage />;
      case 'Profile': return <ProfilePage />;
      default: return <DashboardPage />;
    }
  };

  return (
    <DashboardLayout 
      title={currentPage} 
      activeMenu={currentPage} 
      onMenuSelect={(key) => setCurrentPage(key)}>
      {renderPage()}
      <CorrectionModal 
        isVisible={requiresCorrection} 
        data={correctionData?.data?.incompleteShift ? {
          shiftId: correctionData.data.incompleteShift.shiftId || correctionData.data.incompleteShift._id,
          shiftDate: correctionData.data.incompleteShift.shiftDate,
          loginTime: correctionData.data.incompleteShift.loginTime || correctionData.data.incompleteShift.checkIn?.time,
        } : correctionData?.data} 
      />
    </DashboardLayout>
  );
}

import {SafeAreaProvider} from 'react-native-safe-area-context';

import {Provider} from 'react-redux';
import {store} from './store';

export default function App() {
  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <MainLayout>
          <AppContent />
        </MainLayout>
      </Provider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  contentArea: {
    flex: 1,
  },
});

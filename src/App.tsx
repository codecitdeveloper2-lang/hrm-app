import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import {COLORS, globalStyles} from './styles';
import {AppProvider} from './store';
import LoginScreen from './pages/Login';
import DashboardPage from './pages/Dashboard';
import UsersPage from './pages/Users';
import AttendancePage from './pages/Attendance';
import SchedulePage from './pages/Schedule';
import LeavePage from './pages/Leave';
import ProfilePage from './pages/Profile';
import Sidebar from './components/layout/Sidebar';
import MainLayout from './components/layout/MainLayout';

const {width} = Dimensions.get('window');

const NAV_ITEMS = [
  {key: 'Dashboard', label: 'Dashboard', icon: '📊'},
  {key: 'Users', label: 'Users', icon: '👥'},
  {key: 'Attendance', label: 'Attendance', icon: '✅'},
  {key: 'Schedule', label: 'Schedule', icon: '📅'},
  {key: 'Leave', label: 'Leave', icon: '✉️'},
  {key: 'Profile', label: 'Profile', icon: '👤'},
];

function AppContent() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentPage, setCurrentPage] = useState('Dashboard');

  if (!isAuthenticated) {
    return <LoginScreen onLogin={() => setIsAuthenticated(true)} />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'Dashboard': return <DashboardPage />;
      case 'Users': return <UsersPage />;
      case 'Attendance': return <AttendancePage />;
      case 'Schedule': return <SchedulePage />;
      case 'Leave': return <LeavePage />;
      case 'Profile': return <ProfilePage onLogout={() => setIsAuthenticated(false)} />;
      default: return <DashboardPage />;
    }
  };

  return (
    <View style={styles.mainContainer}>
      <Sidebar 
        items={NAV_ITEMS}
        activeKey={currentPage}
        onSelect={(key) => setCurrentPage(key)}
      />
      <View style={styles.contentArea}>
        {renderPage()}
      </View>
    </View>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainLayout>
        <AppContent />
      </MainLayout>
    </AppProvider>
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

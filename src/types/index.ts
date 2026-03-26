// User types
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'employee';
  avatar?: string;
  department?: string;
  joinDate?: string;
}

// Auth types
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData extends LoginCredentials {
  name: string;
  confirmPassword: string;
}

// Attendance types
export interface AttendanceRecord {
  id: string;
  userId: string;
  date: string;
  checkIn: string;
  checkOut?: string;
  status: 'present' | 'absent' | 'late' | 'half-day';
}

// Leave types
export interface LeaveRequest {
  id: string;
  userId: string;
  type: 'sick' | 'casual' | 'earned' | 'unpaid';
  startDate: string;
  endDate: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
}

// Schedule types
export interface Schedule {
  id: string;
  userId: string;
  shiftStart: string;
  shiftEnd: string;
  day: string;
}

// Navigation types
export type RootStackParamList = {
  Login: undefined;
  Dashboard: undefined;
  Users: undefined;
  Attendance: undefined;
  Schedule: undefined;
  Leave: undefined;
};

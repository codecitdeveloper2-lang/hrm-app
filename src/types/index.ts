// User types
export interface User {
  id: string;
  _id?: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  role: 'admin' | 'manager' | 'employee' | 'hr';
  avatar?: string;
  department?: string;
  designation?: string;
  joinDate?: string;
  location?: string;
  phone?: string;
  workingHours?: {
    startTime: string;
    endTime: string;
    weeklyOff: string[];
  };
  accessToken?: string;
  refreshToken?: string;
  sessionId?: string;
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

// Reimbursement types
export type ReimbursementStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export interface ReimbursementAttachment {
  fileName: string;
  fileUrl: string;
}

export interface Reimbursement {
  _id: string;
  employeeId: string;
  employeeName: string;
  reimbursementTypeId: string;
  reimbursementType: string;
  title: string;
  description: string;
  amount: number;
  expenseDate: string;
  status: ReimbursementStatus;
  attachments: ReimbursementAttachment[];
  approval?: {
    rejectionReason?: string;
  };
  rejectionReason?: string;
}

// Navigation types
export type RootStackParamList = {
  Login: undefined;
  Dashboard: undefined;
  Users: undefined;
  Attendance: undefined;
  Schedule: undefined;
  Leave: undefined;
  Reimbursement: undefined;
};

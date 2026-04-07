// API Service - Base configuration
const BASE_URL = 'https://crm-api-production-4d4f.up.railway.app/api';

interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
}

class ApiService {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  /**
   * Set the authorization token for API requests.
   */
  setToken(token: string | null) {
    this.token = token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Refresh the access and refresh tokens using a valid refresh token.
   */
  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    const url = `${this.baseUrl}/auth/refresh-token`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      throw new Error('Refresh token expired or invalid');
    }

    const result = await response.json();
    if (result.accessToken) {
      this.setToken(result.accessToken);
    }
    return result;
  }

  /**
   * Clock in for attendance.
   */
  async clockIn(data: { deviceInfo: string; remarks: string }): Promise<ApiResponse<any>> {
    return this.post<any>('/attendance/clock-in', data);
  }

  /**
   * Clock out from attendance.
   */
  async clockOut(data: { deviceInfo: string }): Promise<ApiResponse<any>> {
    return this.post<any>('/attendance/clock-out', data);
  }

  /**
   * Get current clock-in status.
   */
  async getClockInStatus(): Promise<ApiResponse<any>> {
    return this.get<any>('/attendance/check-in-status');
  }

  /**
   * Submit attendance correction request.
   */
  async requestCorrection(data: { 
    shiftId?: string; 
    shiftDate: string; 
    logoutTime: string; 
    reason: string; 
    remarks: string;
  }): Promise<ApiResponse<any>> {
    return this.post<any>('/attendance/correction', data);
  }

  /**
   * Verify the password reset OTP.
   */
  async verifyOtp(email: string, otp: string): Promise<ApiResponse<any>> {
    return this.post<any>('/auth/verify-otp', { email, otp });
  }

  /**
   * Reset the password using the verified OTP.
   */
  async resetPassword(data: { email: string; otp: string; newPassword: string }): Promise<ApiResponse<any>> {
    return this.post<any>('/auth/reset-password', data);
  }

  /**
   * Request a password reset OTP.
   */
  async forgotPassword(email: string): Promise<ApiResponse<any>> {
    return this.post<any>('/auth/forgot-password', { email });
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {method: 'GET'});
  }

  async post<T>(endpoint: string, body: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async put<T>(endpoint: string, body: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {method: 'DELETE'});
  }
}

export const apiService = new ApiService(BASE_URL);

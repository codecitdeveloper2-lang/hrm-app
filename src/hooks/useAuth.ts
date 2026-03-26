import {useState, useCallback} from 'react';
import {AuthState, LoginCredentials, User} from '../types';

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>(initialState);

  const login = useCallback(async (credentials: LoginCredentials) => {
    setAuthState(prev => ({...prev, isLoading: true, error: null}));

    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(() => resolve(true), 1500));

      const mockUser: User = {
        id: '1',
        name: 'John Doe',
        email: credentials.email,
        role: 'admin',
        department: 'Engineering',
      };

      setAuthState({
        user: mockUser,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      return true;
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Invalid credentials. Please try again.',
      }));
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    setAuthState(initialState);
  }, []);

  return {
    ...authState,
    login,
    logout,
  };
}

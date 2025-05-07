import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiRequest } from '@/lib/queryClient';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  profilePic?: string;
  location?: string;
  phoneNumber?: string;
  role: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (username: string, password: string) => Promise<any>;
  register: (userData: RegisterData) => Promise<any>;
  logout: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  location?: string;
  phoneNumber?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  
  // Fetch current user
  const { data: userData, isLoading, refetch } = useQuery({
    queryKey: ['/api/auth/me'],
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  const isAuthenticated = !!userData?.user;
  const user = userData?.user || null;
  
  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: { username: string; password: string }) => {
      try {
        const res = await apiRequest('POST', '/api/auth/login', credentials);
        return await res.json();
      } catch (error) {
        throw new Error(error.message || 'Login failed');
      }
    },
    onSuccess: () => {
      setError(null);
      refetch();
    },
    onError: (error: Error) => {
      setError(error.message || 'Login failed');
    },
  });
  
  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (userData: RegisterData) => {
      try {
        const res = await apiRequest('POST', '/api/auth/register', userData);
        return await res.json();
      } catch (error) {
        throw new Error(error.message || 'Registration failed');
      }
    },
    onSuccess: () => {
      setError(null);
    },
    onError: (error: Error) => {
      setError(error.message || 'Registration failed');
    },
  });
  
  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      try {
        const res = await apiRequest('POST', '/api/auth/logout', {});
        return await res.json();
      } catch (error) {
        throw new Error(error.message || 'Logout failed');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      queryClient.clear();
    },
    onError: (error: Error) => {
      setError(error.message || 'Logout failed');
    },
  });
  
  const login = async (username: string, password: string) => {
    return loginMutation.mutateAsync({ username, password });
  };
  
  const register = async (userData: RegisterData) => {
    return registerMutation.mutateAsync(userData);
  };
  
  const logout = async () => {
    await logoutMutation.mutateAsync();
  };
  
  const value = {
    isAuthenticated,
    user,
    login,
    register,
    logout,
    isLoading: isLoading || loginMutation.isPending || registerMutation.isPending || logoutMutation.isPending,
    error,
  };
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

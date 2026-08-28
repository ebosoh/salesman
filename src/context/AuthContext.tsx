import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Profile, UserRole } from '../types';
import { api, initLocalMockStore } from '../services/supabase';
import { TrackingService } from '../services/trackingService';
import { getKenyaNow, isWithinWorkingHours } from '../services/workingHours';

interface AuthContextType {
  user: Profile | null;
  role: UserRole;
  isLoading: boolean;
  isClockedIn: boolean;
  clockInTime: string | null;
  login: (phoneNumber: string, pin?: string) => Promise<boolean>;
  logout: () => void;
  clockIn: () => Promise<boolean>;
  clockOut: () => void;
  setUser: (user: Profile | null) => void;
  setRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [clockInTime, setClockInTime] = useState<string | null>(null);

  useEffect(() => {
    initLocalMockStore();

    // Check saved session
    const savedUser = localStorage.getItem('sewak_current_user');
    const savedShift = localStorage.getItem('sewak_shift_status');

    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setUser(parsed);

        if (savedShift) {
          const shiftData = JSON.parse(savedShift);
          // Check if clock in was today
          const todayStr = getKenyaNow().toISOString().split('T')[0];
          if (shiftData.isClockedIn && shiftData.date === todayStr && isWithinWorkingHours()) {
            setIsClockedIn(true);
            setClockInTime(shiftData.clockInTime);
            TrackingService.startTracking(parsed);
          }
        }
      } catch (err) {
        console.error('Failed to parse saved user', err);
      }
    } else {
      // Default to John Kimani for rapid testing/demo if desired
      const defaultAgent: Profile = {
        id: '11111111-1111-1111-1111-111111111111',
        full_name: 'John Kimani',
        phone_number: '0712345678',
        role: 'field_agent',
        device_fingerprint: 'FP-A14-KEN',
        pin: '1234',
        is_active: true
      };
      setUser(defaultAgent);
      localStorage.setItem('sewak_current_user', JSON.stringify(defaultAgent));
    }

    setIsLoading(false);
  }, []);

  const login = async (phoneNumber: string, pin: string = '1234'): Promise<boolean> => {
    setIsLoading(true);
    try {
      const profile = await api.authenticate(phoneNumber, pin);
      if (profile && profile.is_active) {
        setUser(profile);
        localStorage.setItem('sewak_current_user', JSON.stringify(profile));
        setIsLoading(false);
        return true;
      }
      setIsLoading(false);
      return false;
    } catch (err) {
      console.error('Login error', err);
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    clockOut();
    setUser(null);
    localStorage.removeItem('sewak_current_user');
    localStorage.removeItem('sewak_shift_status');
  };

  const clockIn = async (): Promise<boolean> => {
    if (!user) return false;
    if (!isWithinWorkingHours()) {
      alert('Tracking is restricted to 8:00 AM - 5:00 PM EAT. Shifts cannot be started outside working hours.');
      return false;
    }

    const time = new Date().toISOString();
    const todayStr = getKenyaNow().toISOString().split('T')[0];
    setIsClockedIn(true);
    setClockInTime(time);

    localStorage.setItem(
      'sewak_shift_status',
      JSON.stringify({
        isClockedIn: true,
        clockInTime: time,
        date: todayStr
      })
    );

    await TrackingService.startTracking(user);
    return true;
  };

  const clockOut = () => {
    setIsClockedIn(false);
    setClockInTime(null);
    localStorage.removeItem('sewak_shift_status');
    TrackingService.stopTracking();
  };

  const setRole = (newRole: UserRole) => {
    if (user) {
      const updated = { ...user, role: newRole };
      setUser(updated);
      localStorage.setItem('sewak_current_user', JSON.stringify(updated));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || 'field_agent',
        isLoading,
        isClockedIn,
        clockInTime,
        login,
        logout,
        clockIn,
        clockOut,
        setUser,
        setRole
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

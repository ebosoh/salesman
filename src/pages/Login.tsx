import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { INITIAL_PROFILES } from '../services/supabase';
import { Phone, Lock, Shield, UserCheck, ArrowRight, CheckCircle2 } from 'lucide-react';

export const Login: React.FC = () => {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!phoneNumber) {
      setError('Please enter your registered phone number.');
      return;
    }

    const success = await login(phoneNumber, pin || '1234');
    if (success) {
      navigate('/agent');
    } else {
      setError('Invalid credentials or inactive account. Try demo logins below.');
    }
  };

  const handleQuickDemoLogin = async (phone: string, role: string, defaultPin: string = '1234') => {
    setPhoneNumber(phone);
    setPin(defaultPin);
    const success = await login(phone, defaultPin);
    if (success) {
      if (role === 'admin') {
        navigate('/admin/map');
      } else {
        navigate('/agent');
      }
    }
  };

  return (
    <div className="min-h-screen bg-surface-muted flex flex-col justify-center py-12 sm:px-6 lg:px-8 px-4">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-brand-blue flex items-center justify-center shadow-xl border-2 border-brand-red mb-3">
            <span className="font-black text-white text-3xl">S</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-blue tracking-tight">
            SEWAK PLASTICS
          </h1>
          <p className="text-xs uppercase tracking-widest font-bold text-brand-red mt-0.5">
            Water Tanks & Plumbing Pipes • Field Sales PWA
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl rounded-2xl border border-slate-200 sm:px-10">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-brand-red text-xs p-3 rounded-xl font-medium">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Phone Number (Kenya)
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="tel"
                  placeholder="0712345678"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue sm:text-sm font-mono min-h-[48px]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                4-Digit Security PIN
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  maxLength={4}
                  placeholder="••••"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue sm:text-sm font-mono min-h-[48px]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center space-x-2 py-3.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-brand-blue hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue transition active:scale-98 min-h-[48px] disabled:opacity-50"
            >
              <span>{isLoading ? 'Signing In...' : 'Sign In to Workspace'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Logins Section */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider text-center mb-3">
              One-Click Demo Profiles
            </h3>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('0712345601', 'field_agent', '1234')}
                className="w-full flex items-center justify-between p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs transition text-left min-h-[44px]"
              >
                <div className="flex items-center space-x-2.5">
                  <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                    J
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">John Kimani (Nakuru CBD)</p>
                    <p className="text-[11px] text-slate-500 font-mono">0712 345 601 • Field Agent</p>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-blue-600">Login &rarr;</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('0712345613', 'field_agent', '1234')}
                className="w-full flex items-center justify-between p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs transition text-left min-h-[44px]"
              >
                <div className="flex items-center space-x-2.5">
                  <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                    G
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">Geoffrey Kiptoo (Naivasha)</p>
                    <p className="text-[11px] text-slate-500 font-mono">0712 345 613 • Field Agent</p>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-blue-600">Login &rarr;</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('0700000000', 'admin', '8888')}
                className="w-full flex items-center justify-between p-2.5 bg-brand-blue/5 hover:bg-brand-blue/10 border border-brand-blue/20 rounded-xl text-xs transition text-left min-h-[44px]"
              >
                <div className="flex items-center space-x-2.5">
                  <div className="w-7 h-7 rounded-full bg-brand-blue text-white flex items-center justify-center font-bold text-xs">
                    S
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">Sarah Mwangi (Operations Admin)</p>
                    <p className="text-[11px] text-slate-500 font-mono">0700 000 000 • Admin Mode</p>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-brand-red">Admin &rarr;</span>
              </button>
            </div>
          </div>

          <div className="mt-4 text-center">
            <p className="text-[11px] text-slate-400">
              Kenya Data Protection Compliant • Shift hours: 8:00 AM – 5:00 PM EAT
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

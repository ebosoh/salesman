import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  MapPin,
  ClipboardList,
  Map as MapIcon,
  Users,
  LogOut,
  Shield,
  UserCheck,
  Menu,
  X,
  PlusCircle,
  BarChart3
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, role, setRole, logout, isClockedIn } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleRole = () => {
    const nextRole = role === 'field_agent' ? 'admin' : 'field_agent';
    setRole(nextRole);
    if (nextRole === 'admin') {
      navigate('/admin/map');
    } else {
      navigate('/agent');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="bg-brand-blue text-white shadow-lg sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <Link to={role === 'admin' ? '/admin/map' : '/agent'} className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-brand-red flex items-center justify-center shadow-md group-hover:scale-105 transition">
              <span className="font-black text-white text-lg">S</span>
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-lg tracking-tight text-white">SEWAK</span>
                <span className="text-[10px] bg-brand-red text-white font-bold px-1.5 py-0.5 rounded">PWA</span>
              </div>
              <p className="text-[10px] text-blue-200 uppercase tracking-wider font-semibold">Plastics Kenya</p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            {role === 'field_agent' ? (
              <>
                <Link
                  to="/agent"
                  className={`px-3 py-2 rounded-lg text-sm font-semibold flex items-center space-x-2 transition ${
                    isActive('/agent') ? 'bg-white/20 text-white' : 'text-blue-100 hover:bg-white/10'
                  }`}
                >
                  <MapPin className="w-4 h-4 text-brand-red-light" />
                  <span>Agent Dashboard</span>
                </Link>
                <Link
                  to="/agent/visit"
                  className={`px-3.5 py-2 rounded-lg text-sm font-bold flex items-center space-x-2 transition bg-brand-red hover:bg-brand-red-dark text-white shadow-md`}
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Record Client Visit</span>
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/admin"
                  className={`px-3 py-2 rounded-lg text-sm font-semibold flex items-center space-x-2 transition ${
                    isActive('/admin') ? 'bg-white/20 text-white' : 'text-blue-100 hover:bg-white/10'
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>Overview</span>
                </Link>
                <Link
                  to="/admin/map"
                  className={`px-3 py-2 rounded-lg text-sm font-semibold flex items-center space-x-2 transition ${
                    isActive('/admin/map') ? 'bg-white/20 text-white' : 'text-blue-100 hover:bg-white/10'
                  }`}
                >
                  <MapIcon className="w-4 h-4 text-brand-red-light" />
                  <span>Live Map Monitor</span>
                </Link>
                <Link
                  to="/admin/visits"
                  className={`px-3 py-2 rounded-lg text-sm font-semibold flex items-center space-x-2 transition ${
                    isActive('/admin/visits') ? 'bg-white/20 text-white' : 'text-blue-100 hover:bg-white/10'
                  }`}
                >
                  <ClipboardList className="w-4 h-4" />
                  <span>Visit Verification</span>
                </Link>
                <Link
                  to="/admin/agents"
                  className={`px-3 py-2 rounded-lg text-sm font-semibold flex items-center space-x-2 transition ${
                    isActive('/admin/agents') ? 'bg-white/20 text-white' : 'text-blue-100 hover:bg-white/10'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>Agents Roster</span>
                </Link>
              </>
            )}
          </nav>

          {/* Right Role Switcher & User Meta */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Quick Demo Role Switcher */}
            <button
              onClick={toggleRole}
              title="Click to toggle between Field Agent and Admin view"
              className="flex items-center space-x-1.5 bg-blue-900/60 hover:bg-blue-800 border border-blue-700/50 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-blue-200 transition"
            >
              {role === 'admin' ? (
                <>
                  <Shield className="w-3.5 h-3.5 text-amber-400" />
                  <span>Admin Mode</span>
                </>
              ) : (
                <>
                  <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Agent Mode</span>
                </>
              )}
              <span className="text-[10px] bg-white/20 px-1 py-0.2 rounded ml-1">Switch</span>
            </button>

            {/* User Pill */}
            <div className="flex items-center space-x-2 bg-blue-950/60 px-3 py-1.5 rounded-xl border border-blue-800/40">
              <div className="w-7 h-7 rounded-full bg-brand-red text-white flex items-center justify-center font-bold text-xs">
                {user?.full_name ? user.full_name.charAt(0) : 'U'}
              </div>
              <div className="text-left">
                <p className="text-xs font-bold leading-tight">{user?.full_name || 'Guest User'}</p>
                <p className="text-[10px] text-blue-300 capitalize">{role.replace('_', ' ')}</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-2 text-blue-300 hover:text-white hover:bg-white/10 rounded-lg transition"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center space-x-2">
            <button
              onClick={toggleRole}
              className="bg-blue-900 text-blue-200 text-xs px-2.5 py-1 rounded-md font-semibold border border-blue-700"
            >
              {role === 'admin' ? '🛡️ Admin' : '👤 Agent'}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-white hover:bg-white/10 min-h-[48px] min-w-[48px] flex items-center justify-center"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-t border-blue-900 px-4 py-3 space-y-2 animate-fadeIn">
          <div className="flex items-center justify-between py-2 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-brand-red text-white flex items-center justify-center font-bold text-sm">
                {user?.full_name ? user.full_name.charAt(0) : 'U'}
              </div>
              <div>
                <p className="text-sm font-bold text-white">{user?.full_name}</p>
                <p className="text-xs text-blue-300">{user?.phone_number}</p>
              </div>
            </div>
            {isClockedIn && (
              <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-bold px-2 py-0.5 rounded-full">
                Tracking ON
              </span>
            )}
          </div>

          {role === 'field_agent' ? (
            <>
              <Link
                to="/agent"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center space-x-3 px-3 py-3 rounded-xl text-sm font-semibold min-h-[48px] ${
                  isActive('/agent') ? 'bg-blue-800 text-white' : 'text-slate-200 hover:bg-slate-800'
                }`}
              >
                <MapPin className="w-5 h-5 text-brand-red-light" />
                <span>My Shift & Dashboard</span>
              </Link>
              <Link
                to="/agent/visit"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-3 px-3 py-3 rounded-xl text-sm font-bold bg-brand-red text-white min-h-[48px]"
              >
                <PlusCircle className="w-5 h-5" />
                <span>Record New Client Visit</span>
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center space-x-3 px-3 py-3 rounded-xl text-sm font-semibold min-h-[48px] ${
                  isActive('/admin') ? 'bg-blue-800 text-white' : 'text-slate-200 hover:bg-slate-800'
                }`}
              >
                <BarChart3 className="w-5 h-5" />
                <span>Operations Overview</span>
              </Link>
              <Link
                to="/admin/map"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center space-x-3 px-3 py-3 rounded-xl text-sm font-semibold min-h-[48px] ${
                  isActive('/admin/map') ? 'bg-blue-800 text-white' : 'text-slate-200 hover:bg-slate-800'
                }`}
              >
                <MapIcon className="w-5 h-5 text-brand-red-light" />
                <span>Kenya Real-Time Map Monitor</span>
              </Link>
              <Link
                to="/admin/visits"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center space-x-3 px-3 py-3 rounded-xl text-sm font-semibold min-h-[48px] ${
                  isActive('/admin/visits') ? 'bg-blue-800 text-white' : 'text-slate-200 hover:bg-slate-800'
                }`}
              >
                <ClipboardList className="w-5 h-5" />
                <span>Visit Verification & Anti-Spoof</span>
              </Link>
              <Link
                to="/admin/agents"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center space-x-3 px-3 py-3 rounded-xl text-sm font-semibold min-h-[48px] ${
                  isActive('/admin/agents') ? 'bg-blue-800 text-white' : 'text-slate-200 hover:bg-slate-800'
                }`}
              >
                <Users className="w-5 h-5" />
                <span>Sales Agents Roster</span>
              </Link>
            </>
          )}

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
            <button
              onClick={() => {
                toggleRole();
                setMobileMenuOpen(false);
              }}
              className="text-xs text-blue-300 hover:text-white py-2 flex items-center space-x-1"
            >
              <Shield className="w-4 h-4" />
              <span>Switch to {role === 'admin' ? 'Field Agent' : 'Admin'} Mode</span>
            </button>
            <button
              onClick={handleLogout}
              className="text-xs text-red-400 hover:text-red-300 py-2 flex items-center space-x-1 font-semibold"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

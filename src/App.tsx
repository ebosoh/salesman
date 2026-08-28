import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { OfflineProvider } from './context/OfflineContext';
import { Navbar } from './components/Navbar';
import { OfflineBanner } from './components/OfflineBanner';

// Pages
import { Login } from './pages/Login';
import { AgentDashboard } from './pages/AgentDashboard';
import { ClientVisitForm } from './pages/ClientVisitForm';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminMapMonitor } from './pages/AdminMapMonitor';
import { AdminVisitVerification } from './pages/AdminVisitVerification';
import { AdminAgentsList } from './pages/AdminAgentsList';

const ProtectedLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface-muted flex items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-10 h-10 border-4 border-brand-blue border-t-brand-red rounded-full animate-spin"></div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Loading Sewak Field Sales...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-surface-muted flex flex-col font-sans">
      <OfflineBanner />
      <Navbar />
      <main className="flex-1 pb-16 md:pb-6">{children}</main>
    </div>
  );
};

const RootRedirect: React.FC = () => {
  const { user, role, isLoading } = useAuth();

  if (isLoading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={role === 'admin' ? '/admin/map' : '/agent'} replace />;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <OfflineProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<RootRedirect />} />

            {/* Field Agent Routes */}
            <Route
              path="/agent"
              element={
                <ProtectedLayout>
                  <AgentDashboard />
                </ProtectedLayout>
              }
            />
            <Route
              path="/agent/visit"
              element={
                <ProtectedLayout>
                  <ClientVisitForm />
                </ProtectedLayout>
              }
            />

            {/* Operations Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedLayout>
                  <AdminDashboard />
                </ProtectedLayout>
              }
            />
            <Route
              path="/admin/map"
              element={
                <ProtectedLayout>
                  <AdminMapMonitor />
                </ProtectedLayout>
              }
            />
            <Route
              path="/admin/visits"
              element={
                <ProtectedLayout>
                  <AdminVisitVerification />
                </ProtectedLayout>
              }
            />
            <Route
              path="/admin/agents"
              element={
                <ProtectedLayout>
                  <AdminAgentsList />
                </ProtectedLayout>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<RootRedirect />} />
          </Routes>
        </BrowserRouter>
      </OfflineProvider>
    </AuthProvider>
  );
};

export default App;

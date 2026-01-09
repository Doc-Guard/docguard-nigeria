
import React, { lazy, Suspense } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import Dashboard from './components/dashboard';
const DocBuilder = lazy(() => import('./components/doc-builder'));
const ChargeRegistry = lazy(() => import('./components/registry'));
const KYCOrchestrator = lazy(() => import('./components/kyc-orchestrator'));
const Analytics = lazy(() => import('./components/analytics'));
const Loans = lazy(() => import('./components/loans'));
const Login = lazy(() => import('./components/auth'));
const Settings = lazy(() => import('./components/settings'));
const ActivityPage = lazy(() => import('./components/dashboard/ActivityPage'));
const DeadlinePage = lazy(() => import('./components/deadlines'));
const HelpPage = lazy(() => import('./components/help/HelpPage'));
const NotificationPage = lazy(() => import('./components/notifications/NotificationPage'));
const OnboardingTour = lazy(() => import('./components/onboarding/OnboardingTour'));
import MainLayout from './components/layout/MainLayout';

import { AuthProvider, useAuth } from './components/auth/AuthContext';
import { ToastProvider } from './components/common/Toast';

// Inner component to use the hook
const AppContent: React.FC = () => {
  const location = useLocation();
  const { session, loading, signOut, user, profile, updateProfile } = useAuth();

  const handleOnboardingComplete = async () => {
    if (profile) {
      try {
        await updateProfile({
          preferences: {
            ...profile.preferences,
            hasSeenOnboarding: true
          }
        });
      } catch (e) {
        console.error("Failed to update onboarding status", e);
      }
    }
  };

  if (loading) {
    // ... keep loading state ...
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#0a2e1f]">
        <div className="text-center">
          <Loader2 className="animate-spin text-emerald-500 mx-auto mb-4" size={48} />
          <p className="text-emerald-100 font-black tracking-widest uppercase text-xs">Initializing DocGuard...</p>
        </div>
      </div>
    );
  }

  // If not logged in and not on login page, redirect
  if (!session && location.pathname !== '/login') {
    return <Navigate to="/login" replace />;
  }

  // If logged in and on login page, redirect to dashboard
  if (session && location.pathname === '/login') {
    return <Navigate to="/" replace />;
  }

  // Login Page Route
  if (location.pathname === '/login') {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
      </Routes>
    );
  }

  // Determine display name (Profile > Metadata > Email)
  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email || 'User';

  // Check Onboarding Status
  const showOnboarding = profile && (!profile.preferences || !profile.preferences.hasSeenOnboarding);

  return (
    <MainLayout userEmail={displayName} userProfilePic={profile?.avatar_url} onLogout={signOut}>
      {showOnboarding && (
        <Suspense fallback={null}>
          <OnboardingTour onComplete={handleOnboardingComplete} />
        </Suspense>
      )}
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/doc-builder" element={<DocBuilder />} />
        <Route path="/loans" element={<Loans />} />
        <Route path="/registry" element={<ChargeRegistry />} />
        <Route path="/kyc" element={<KYCOrchestrator />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/deadlines" element={<DeadlinePage />} />
        <Route path="/activity" element={<ActivityPage />} />
        <Route path="/notifications" element={<NotificationPage />} />
        <Route path="/help" element={<HelpPage />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </MainLayout>
  );
};

const App: React.FC = () => {
  return (
    <ToastProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ToastProvider>
  );
};

export default App;

import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import Layout from '@/components/layout/Layout';
import Landing from '@/pages/Landing';
import Dashboard from '@/pages/Dashboard';
import Documents from '@/pages/Documents';
import Workflows from '@/pages/Workflows';
import Settings from '@/pages/Settings';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import NotFound from '@/pages/NotFound';
import ToastContainer from '@/components/ui/Toast';
import ErrorBoundary from '@/components/ui/ErrorBoundary';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

/** Redirect authenticated users away from login/register */
function PublicRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <>{children}</>;
}

/** Wrap the shared Layout — all child routes require auth */
function ProtectedLayout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return isAuthenticated ? <Layout /> : <Navigate to="/login" replace />;
}

export default function App() {
  const { initAuth } = useAuthStore();
  useNetworkStatus();

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  return (
    <ErrorBoundary>
      <ToastContainer />
      <Routes>
        {/* Landing page — always public */}
        <Route path="/" element={<Landing />} />

        {/* Auth pages — redirect away if already logged in */}
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

        {/* App shell — all routes below require authentication */}
        <Route element={<ProtectedLayout />}>
          <Route path="/dashboard" element={<ErrorBoundary><Dashboard /></ErrorBoundary>} />
          <Route path="/documents" element={<ErrorBoundary><Documents /></ErrorBoundary>} />
          <Route path="/workflows" element={<ErrorBoundary><Workflows /></ErrorBoundary>} />
          <Route path="/settings" element={<ErrorBoundary><Settings /></ErrorBoundary>} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </ErrorBoundary>
  );
}

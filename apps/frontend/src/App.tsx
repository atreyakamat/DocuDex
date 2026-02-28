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

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  return (
    <>
      <ToastContainer />
      <Routes>
      {/* Landing page — always public */}
      <Route path="/" element={<Landing />} />

      {/* Auth pages — redirect away if already logged in */}
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

      {/* App shell — all routes below require authentication */}
      <Route element={<ProtectedLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/documents" element={<Documents />} />
        <Route path="/workflows" element={<Workflows />} />
        <Route path="/settings" element={<Settings />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
    </>
  );
}

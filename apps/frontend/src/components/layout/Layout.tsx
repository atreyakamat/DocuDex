import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import GuidedTour from '../ui/GuidedTour';
import WelcomeModal from '../ui/WelcomeModal';
import { useTourStore } from '@/store/tourStore';

export default function Layout() {
  const { hasCompletedTour, openWelcome, isActive, showWelcome } = useTourStore();

  // Auto-show welcome modal for first-time users
  useEffect(() => {
    if (!hasCompletedTour && !isActive && !showWelcome) {
      const t = setTimeout(openWelcome, 1200);
      return () => clearTimeout(t);
    }
  }, []); // only on mount

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
      <WelcomeModal />
      <GuidedTour />
    </div>
  );
}

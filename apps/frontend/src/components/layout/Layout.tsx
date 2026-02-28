import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import GuidedTour from '../ui/GuidedTour';
import { useTourStore } from '@/store/tourStore';

export default function Layout() {
  const { hasCompletedTour, startTour, isActive } = useTourStore();

  // Auto-start tour for first-time users after a short delay
  useEffect(() => {
    if (!hasCompletedTour && !isActive) {
      const t = setTimeout(startTour, 1500);
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
      <GuidedTour />
    </div>
  );
}

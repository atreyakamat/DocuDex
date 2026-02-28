import { create } from 'zustand';

export interface TourStep {
  /** CSS selector for the element to spotlight */
  target: string;
  /** Title of the step */
  title: string;
  /** Description / guidance text */
  content: string;
  /** Where to place the tooltip relative to target */
  placement?: 'top' | 'bottom' | 'left' | 'right';
  /** Optional route to navigate to before showing step */
  route?: string;
}

interface TourState {
  isActive: boolean;
  currentStep: number;
  hasCompletedTour: boolean;
  steps: TourStep[];

  startTour: () => void;
  nextStep: () => void;
  prevStep: () => void;
  skipTour: () => void;
  endTour: () => void;
  resetTour: () => void;
}

const TOUR_STEPS: TourStep[] = [
  {
    target: '[data-tour="sidebar"]',
    title: 'Navigation Sidebar',
    content:
      'This is your main navigation. Access Dashboard, Documents, Workflows, and Settings from here.',
    placement: 'right',
    route: '/dashboard',
  },
  {
    target: '[data-tour="sidebar-dashboard"]',
    title: 'Dashboard',
    content:
      'Your Dashboard gives you a quick overview — total documents, upcoming expirations, and recent activity.',
    placement: 'right',
    route: '/dashboard',
  },
  {
    target: '[data-tour="stats-cards"]',
    title: 'Document Statistics',
    content:
      'See at a glance how many documents you have, how many are valid, and which ones need attention.',
    placement: 'bottom',
    route: '/dashboard',
  },
  {
    target: '[data-tour="recent-docs"]',
    title: 'Recent Documents',
    content:
      'Your most recently uploaded documents appear here for quick access.',
    placement: 'top',
    route: '/dashboard',
  },
  {
    target: '[data-tour="expiry-alerts"]',
    title: 'Expiry Alerts',
    content:
      'Never miss a renewal! Documents expiring soon are highlighted here with countdown timers.',
    placement: 'left',
    route: '/dashboard',
  },
  {
    target: '[data-tour="search-bar"]',
    title: 'Search',
    content:
      'Quickly find any document by name, type, or holder. The AI indexes everything for you.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="notifications"]',
    title: 'Notifications',
    content:
      'Stay informed about document expirations, processing status, and workflow updates.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="sidebar-documents"]',
    title: 'Documents Library',
    content:
      'All your documents live here. Upload, view, share, and manage them in one place.',
    placement: 'right',
    route: '/documents',
  },
  {
    target: '[data-tour="upload-zone"]',
    title: 'Upload Documents',
    content:
      'Drag & drop files here or click to browse. Our AI will automatically classify, extract key data, and generate a summary.',
    placement: 'bottom',
    route: '/documents',
  },
  {
    target: '[data-tour="document-grid"]',
    title: 'Document Grid',
    content:
      'Browse all your documents. Each card shows the type, status, holder name, and expiry info at a glance.',
    placement: 'top',
    route: '/documents',
  },
  {
    target: '[data-tour="sidebar-workflows"]',
    title: 'Workflows',
    content:
      'Use guided workflows to collect all documents needed for common tasks like loan applications or passport renewal.',
    placement: 'right',
    route: '/workflows',
  },
  {
    target: '[data-tour="sidebar-settings"]',
    title: 'Settings',
    content:
      'Configure your profile, notification preferences, and security settings.',
    placement: 'right',
    route: '/settings',
  },
];

const STORAGE_KEY = 'docudex-tour-completed';

export const useTourStore = create<TourState>((set) => ({
  isActive: false,
  currentStep: 0,
  hasCompletedTour: localStorage.getItem(STORAGE_KEY) === 'true',
  steps: TOUR_STEPS,

  startTour: () => set({ isActive: true, currentStep: 0 }),

  nextStep: () =>
    set((state) => {
      const next = state.currentStep + 1;
      if (next >= state.steps.length) {
        localStorage.setItem(STORAGE_KEY, 'true');
        return { isActive: false, currentStep: 0, hasCompletedTour: true };
      }
      return { currentStep: next };
    }),

  prevStep: () =>
    set((state) => ({
      currentStep: Math.max(0, state.currentStep - 1),
    })),

  skipTour: () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    set({ isActive: false, currentStep: 0, hasCompletedTour: true });
  },

  endTour: () => set({ isActive: false, currentStep: 0 }),

  resetTour: () => {
    localStorage.removeItem(STORAGE_KEY);
    set({ isActive: false, currentStep: 0, hasCompletedTour: false });
  },
}));

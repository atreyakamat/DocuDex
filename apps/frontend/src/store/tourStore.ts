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
  /** Emoji icon for the step */
  icon?: string;
}

interface TourState {
  isActive: boolean;
  showWelcome: boolean;
  currentStep: number;
  hasCompletedTour: boolean;
  steps: TourStep[];

  openWelcome: () => void;
  closeWelcome: () => void;
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
    title: 'Your Command Center',
    content:
      'This sidebar is your primary navigation hub. From here you can access every part of DocuDex — your Dashboard for an overview, Documents for your full library, Workflows for guided checklists, and Settings for preferences.',
    placement: 'right',
    route: '/dashboard',
    icon: '🧭',
  },
  {
    target: '[data-tour="sidebar-dashboard"]',
    title: 'Dashboard — Your Overview',
    content:
      'The Dashboard is the first thing you see after logging in. It shows your document stats, recently uploaded files, and any documents approaching their expiry date — all at a glance.',
    placement: 'right',
    route: '/dashboard',
    icon: '📊',
  },
  {
    target: '[data-tour="stats-cards"]',
    title: 'Real-Time Statistics',
    content:
      'These cards give you live numbers: total documents in your vault, how many are currently valid, how many are expiring within 90 days, and how many have already expired. They update automatically.',
    placement: 'bottom',
    route: '/dashboard',
    icon: '📈',
  },
  {
    target: '[data-tour="recent-docs"]',
    title: 'Recent Activity Feed',
    content:
      'Your most recently uploaded and processed documents appear here. Each entry shows the AI-detected document type, upload time, and current validity status. Click "View all" to see everything.',
    placement: 'top',
    route: '/dashboard',
    icon: '🕐',
  },
  {
    target: '[data-tour="expiry-alerts"]',
    title: 'Never Miss an Expiry',
    content:
      'DocuDex runs a nightly check on all your documents. Anything expiring within 90 days appears here with a countdown. You also get in-app notifications at 30 days and 7 days before expiry so you have time to renew.',
    placement: 'left',
    route: '/dashboard',
    icon: '⏰',
  },
  {
    target: '[data-tour="search-bar"]',
    title: 'Intelligent Search',
    content:
      'Search across your entire vault by document name, type, holder name, or any extracted field. The AI indexes all OCR-extracted text, so even content inside scanned images is searchable.',
    placement: 'bottom',
    icon: '🔍',
  },
  {
    target: '[data-tour="notifications"]',
    title: 'Stay Informed',
    content:
      'The notification bell shows real-time alerts — document processing complete, expiry warnings, workflow status changes, and system messages. Unread notifications show a red badge. Click to see details.',
    placement: 'bottom',
    icon: '🔔',
  },
  {
    target: '[data-tour="sidebar-documents"]',
    title: 'Your Document Library',
    content:
      'This is where all your documents live. The library supports filtering by category (Identity, Financial, Educational, etc.), status (Current, Expiring, Expired), and free-text search. You can star important documents for quick access.',
    placement: 'right',
    route: '/documents',
    icon: '📁',
  },
  {
    target: '[data-tour="upload-zone"]',
    title: 'How Uploading Works',
    content:
      'Click here to upload. You can drag & drop files (PDF, JPG, PNG, DOCX up to 50 MB each). Here\'s what happens behind the scenes:\n\n1️⃣ File is saved securely\n2️⃣ OCR extracts all text\n3️⃣ AI classifies the document type\n4️⃣ Key fields (name, ID number, dates) are extracted\n5️⃣ A concise summary is generated\n\nAll of this happens automatically in seconds.',
    placement: 'bottom',
    route: '/documents',
    icon: '📤',
  },
  {
    target: '[data-tour="document-grid"]',
    title: 'Browse & Manage',
    content:
      'Each card shows the document type badge, holder name, status indicator (green = valid, yellow = expiring, red = expired), and AI-generated summary. Click a card to view full details, download, share with a time-limited link, or delete.',
    placement: 'top',
    route: '/documents',
    icon: '🗂️',
  },
  {
    target: '[data-tour="sidebar-workflows"]',
    title: 'Guided Workflows',
    content:
      'Workflows are step-by-step checklists for real-world tasks. For example, the "Home Loan" workflow tells you that you need Aadhaar, PAN, 6 months of bank statements, salary slips, property deed, and ITR returns. Start a workflow and DocuDex tracks your progress.',
    placement: 'right',
    route: '/workflows',
    icon: '📋',
  },
  {
    target: '[data-tour="sidebar-settings"]',
    title: 'Your Preferences',
    content:
      'Update your profile (name, email), change your password, and configure notification preferences. Your account is secured with JWT tokens that rotate automatically, and sessions can be invalidated instantly.',
    placement: 'right',
    route: '/settings',
    icon: '⚙️',
  },
];

const STORAGE_KEY = 'docudex-tour-completed';

export const useTourStore = create<TourState>((set) => ({
  isActive: false,
  showWelcome: false,
  currentStep: 0,
  hasCompletedTour: localStorage.getItem(STORAGE_KEY) === 'true',
  steps: TOUR_STEPS,

  openWelcome: () => set({ showWelcome: true }),
  closeWelcome: () => set({ showWelcome: false }),

  startTour: () => set({ isActive: true, showWelcome: false, currentStep: 0 }),

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
    set({ isActive: false, showWelcome: false, currentStep: 0, hasCompletedTour: true });
  },

  endTour: () => set({ isActive: false, currentStep: 0 }),

  resetTour: () => {
    localStorage.removeItem(STORAGE_KEY);
    set({ isActive: false, showWelcome: false, currentStep: 0, hasCompletedTour: false });
  },
}));

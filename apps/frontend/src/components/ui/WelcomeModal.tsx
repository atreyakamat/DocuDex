/**
 * Welcome modal shown before the guided tour starts.
 * Gives users context about what DocuDex does and invites them
 * to take the tour or skip it.
 */

import { Shield, Brain, Bell, GitBranch, X, Sparkles, ArrowRight } from 'lucide-react';
import { useTourStore } from '../../store/tourStore';

const HIGHLIGHTS = [
  {
    icon: Brain,
    title: 'AI-Powered Classification',
    desc: 'Upload any document and our OCR + AI engine reads, classifies, and extracts key data automatically.',
    color: 'bg-purple-50 text-purple-600',
  },
  {
    icon: Bell,
    title: 'Expiry Tracking',
    desc: 'Never miss a renewal. DocuDex alerts you 30 and 7 days before any document expires.',
    color: 'bg-yellow-50 text-yellow-600',
  },
  {
    icon: GitBranch,
    title: 'Guided Workflows',
    desc: 'Step-by-step checklists for Home Loans, Passport Renewal, GST Registration, and more.',
    color: 'bg-green-50 text-green-600',
  },
  {
    icon: Sparkles,
    title: 'AI Summaries',
    desc: 'Every document gets a concise AI-generated summary — holder name, ID numbers, and status at a glance.',
    color: 'bg-blue-50 text-blue-600',
  },
];

export default function WelcomeModal() {
  const { showWelcome, startTour, skipTour } = useTourStore();

  if (!showWelcome) return null;

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={skipTour} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 overflow-hidden animate-fade-in">
        {/* Close button */}
        <button
          onClick={skipTour}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header gradient */}
        <div className="bg-gradient-to-br from-primary-600 to-indigo-600 px-8 pt-8 pb-10 text-white text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-white/20 rounded-2xl mb-4">
            <Shield className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Welcome to DocuDex!</h2>
          <p className="text-white/80 text-sm leading-relaxed max-w-sm mx-auto">
            Your AI-powered document vault. Upload documents and let our AI
            classify, extract, summarize, and track them for you.
          </p>
        </div>

        {/* Feature highlights */}
        <div className="px-8 py-6 space-y-3">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
            What DocuDex does for you
          </p>
          {HIGHLIGHTS.map((h) => (
            <div key={h.title} className="flex items-start gap-3">
              <div className={`p-2 rounded-lg shrink-0 ${h.color}`}>
                <h.icon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{h.title}</p>
                <p className="text-xs text-gray-500 leading-relaxed">{h.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="border-t border-gray-100 px-8 py-5 flex items-center justify-between">
          <button
            onClick={skipTour}
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            Skip for now
          </button>
          <button
            onClick={startTour}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors shadow-sm"
          >
            Take the Tour
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

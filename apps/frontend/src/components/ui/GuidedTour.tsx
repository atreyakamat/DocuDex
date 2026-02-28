import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTourStore } from '../../store/tourStore';

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

const PADDING = 8;

export default function GuidedTour() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    isActive,
    currentStep,
    steps,
    nextStep,
    prevStep,
    skipTour,
  } = useTourStore();

  const [targetRect, setTargetRect] = useState<Rect | null>(null);
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [isNavigating, setIsNavigating] = useState(false);

  const step = steps[currentStep];

  // Navigate to the step's route if needed
  useEffect(() => {
    if (!isActive || !step) return;

    if (step.route && location.pathname !== step.route) {
      setIsNavigating(true);
      navigate(step.route);
      // Wait a tick for route change + render
      const t = setTimeout(() => setIsNavigating(false), 400);
      return () => clearTimeout(t);
    }
  }, [isActive, currentStep, step, location.pathname, navigate]);

  // Find the target element and measure it
  const measure = useCallback(() => {
    if (!isActive || !step || isNavigating) {
      setTargetRect(null);
      return;
    }
    const el = document.querySelector(step.target) as HTMLElement | null;
    if (!el) {
      setTargetRect(null);
      return;
    }

    const r = el.getBoundingClientRect();
    setTargetRect({
      top: r.top,
      left: r.left,
      width: r.width,
      height: r.height,
    });
  }, [isActive, step, isNavigating]);

  useEffect(() => {
    measure();
    const timer = setTimeout(measure, 500); // re-measure after animations
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', measure, true);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', measure, true);
    };
  }, [measure]);

  // Position tooltip relative to target
  useEffect(() => {
    if (!targetRect || !tooltipRef.current) return;
    const tt = tooltipRef.current;
    const ttRect = tt.getBoundingClientRect();
    const placement = step?.placement || 'bottom';
    const gap = 12;

    let top = 0;
    let left = 0;

    switch (placement) {
      case 'bottom':
        top = targetRect.top + targetRect.height + gap + PADDING;
        left = targetRect.left + targetRect.width / 2 - ttRect.width / 2;
        break;
      case 'top':
        top = targetRect.top - ttRect.height - gap - PADDING;
        left = targetRect.left + targetRect.width / 2 - ttRect.width / 2;
        break;
      case 'right':
        top = targetRect.top + targetRect.height / 2 - ttRect.height / 2;
        left = targetRect.left + targetRect.width + gap + PADDING;
        break;
      case 'left':
        top = targetRect.top + targetRect.height / 2 - ttRect.height / 2;
        left = targetRect.left - ttRect.width - gap - PADDING;
        break;
    }

    // Keep within viewport
    top = Math.max(8, Math.min(top, window.innerHeight - ttRect.height - 8));
    left = Math.max(8, Math.min(left, window.innerWidth - ttRect.width - 8));

    setTooltipStyle({ top, left });
  }, [targetRect, step]);

  // Keyboard navigation
  useEffect(() => {
    if (!isActive) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') skipTour();
      if (e.key === 'ArrowRight' || e.key === 'Enter') nextStep();
      if (e.key === 'ArrowLeft') prevStep();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isActive, skipTour, nextStep, prevStep]);

  if (!isActive || !step) return null;

  const isLast = currentStep === steps.length - 1;
  const isFirst = currentStep === 0;

  // Spotlight clip path (cut-out rectangle)
  const clip = targetRect
    ? `polygon(
        0% 0%, 0% 100%, 100% 100%, 100% 0%, 0% 0%,
        ${targetRect.left - PADDING}px ${targetRect.top - PADDING}px,
        ${targetRect.left + targetRect.width + PADDING}px ${targetRect.top - PADDING}px,
        ${targetRect.left + targetRect.width + PADDING}px ${targetRect.top + targetRect.height + PADDING}px,
        ${targetRect.left - PADDING}px ${targetRect.top + targetRect.height + PADDING}px,
        ${targetRect.left - PADDING}px ${targetRect.top - PADDING}px
      )`
    : undefined;

  return (
    <div className="fixed inset-0 z-[9999]" aria-label="Guided tour overlay">
      {/* Overlay with spotlight hole */}
      <div
        className="absolute inset-0 bg-black/50 transition-all duration-300"
        style={{ clipPath: clip }}
        onClick={skipTour}
      />

      {/* Highlight border around target */}
      {targetRect && (
        <div
          className="absolute rounded-lg border-2 border-blue-400 shadow-[0_0_0_4px_rgba(59,130,246,0.25)] pointer-events-none transition-all duration-300"
          style={{
            top: targetRect.top - PADDING,
            left: targetRect.left - PADDING,
            width: targetRect.width + PADDING * 2,
            height: targetRect.height + PADDING * 2,
          }}
        />
      )}

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className="absolute w-[360px] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden transition-all duration-300"
        style={tooltipStyle}
      >
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {step.icon && <span className="text-base">{step.icon}</span>}
            <span className="text-xs font-medium text-white/80">
              Step {currentStep + 1} of {steps.length}
            </span>
          </div>
          <button
            onClick={skipTour}
            className="text-white/60 hover:text-white transition-colors"
            aria-label="Skip tour"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5">
          {/* Content */}
          <h3 className="text-base font-bold text-gray-900 mb-2">
            {step.title}
          </h3>
          <div className="text-sm text-gray-600 leading-relaxed mb-4 whitespace-pre-line">
            {step.content}
          </div>

          {/* Progress bar */}
          <div className="w-full h-1.5 bg-gray-100 rounded-full mb-4">
            <div
              className="h-1.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <button
              onClick={skipTour}
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              Skip tour
            </button>
            <div className="flex gap-2">
              {!isFirst && (
                <button
                  onClick={prevStep}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <ChevronLeft className="w-3 h-3" />
                  Back
                </button>
              )}
              <button
                onClick={nextStep}
                className="flex items-center gap-1 px-4 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
              >
                {isLast ? '✅ Finish Tour' : 'Next'}
                {!isLast && <ChevronRight className="w-3 h-3" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

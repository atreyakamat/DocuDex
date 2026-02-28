/**
 * Offline / network error detection hook.
 * Shows a toast when the user goes offline and reconnects.
 */

import { useEffect, useRef } from 'react';
import { toast } from '@/store/toastStore';

export function useNetworkStatus() {
  const wasOffline = useRef(false);

  useEffect(() => {
    function handleOffline() {
      wasOffline.current = true;
      toast.warning('You are offline. Some features may not work.');
    }

    function handleOnline() {
      if (wasOffline.current) {
        toast.success('Back online! Reconnected successfully.');
        wasOffline.current = false;
      }
    }

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    // Check initial state
    if (!navigator.onLine) {
      handleOffline();
    }

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);
}

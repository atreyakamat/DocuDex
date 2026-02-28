import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastStore {
  toasts: ToastItem[];
  add: (type: ToastType, message: string, duration?: number) => void;
  remove: (id: string) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
  warning: (message: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],

  add(type, message, duration = 4000) {
    const id = crypto.randomUUID();
    set((s) => ({ toasts: [...s.toasts, { id, type, message, duration }] }));
    if (duration > 0) {
      setTimeout(() => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })), duration);
    }
  },

  remove: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

  success: (message) => useToastStore.getState().add('success', message),
  error:   (message) => useToastStore.getState().add('error', message),
  info:    (message) => useToastStore.getState().add('info', message),
  warning: (message) => useToastStore.getState().add('warning', message),
}));

// Convenience singleton — import this in non-component code
export const toast = {
  success: (msg: string) => useToastStore.getState().success(msg),
  error:   (msg: string) => useToastStore.getState().error(msg),
  info:    (msg: string) => useToastStore.getState().info(msg),
  warning: (msg: string) => useToastStore.getState().warning(msg),
};

import { create } from 'zustand';

export type ToastTone = 'success' | 'error' | 'info';

export interface ToastItem {
  id: number;
  tone: ToastTone;
  title: string;
  message?: string;
}

interface ToastState {
  toasts: ToastItem[];
  push: (tone: ToastTone, title: string, message?: string) => void;
  dismiss: (id: number) => void;
}

let counter = 0;

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],
  push: (tone, title, message) => {
    counter += 1;
    const id = counter;
    set({ toasts: [...get().toasts, { id, tone, title, message }] });
    window.setTimeout(() => {
      set({ toasts: get().toasts.filter((toast) => toast.id !== id) });
    }, 4200);
  },
  dismiss: (id) => set({ toasts: get().toasts.filter((toast) => toast.id !== id) }),
}));

export function toastSuccess(title: string, message?: string): void {
  useToastStore.getState().push('success', title, message);
}

export function toastError(title: string, message?: string): void {
  useToastStore.getState().push('error', title, message);
}

export function toastInfo(title: string, message?: string): void {
  useToastStore.getState().push('info', title, message);
}

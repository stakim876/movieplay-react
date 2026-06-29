import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";

interface ToastItem {
  id: number;
  message: string;
  type: string;
  duration: number;
}

interface ToastState {
  toasts: ToastItem[];
  showToast: (message: string, type?: string, duration?: number) => number;
  removeToast: (id: number) => void;
  success: (message: string, duration?: number) => number;
  error: (message: string, duration?: number) => number;
  info: (message: string, duration?: number) => number;
  warning: (message: string, duration?: number) => number;
}

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],

  showToast: (message, type = "info", duration = 3000) => {
    const id = Date.now() + Math.random();
    set((state) => ({
      // 배열에 push 하면 같은 참조라 화면이 안 바뀔 수 있음 → 새 배열 [...] 로 복사
      toasts: [...state.toasts, { id, message, type, duration }],
    }));

    if (duration > 0) {
      setTimeout(() => get().removeToast(id), duration);
    }

    return id;
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    }));
  },

  success: (message, duration) => get().showToast(message, "success", duration),
  error: (message, duration) => get().showToast(message, "error", duration),
  info: (message, duration) => get().showToast(message, "info", duration),
  warning: (message, duration) => get().showToast(message, "warning", duration),
}));

export function useToast() {
  return useToastStore(
    useShallow((s) => ({
      toasts: s.toasts,
      showToast: s.showToast,
      removeToast: s.removeToast,
      success: s.success,
      error: s.error,
      info: s.info,
      warning: s.warning,
    }))
  );
}

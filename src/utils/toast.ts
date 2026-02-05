import type { Toast } from '../components/ui/Toast';

class ToastManager {
  private toasts: Toast[] = [];
  private listeners: Set<(toasts: Toast[]) => void> = new Set();
  private idCounter = 0;

  subscribe(listener: (toasts: Toast[]) => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((listener) => listener([...this.toasts]));
  }

  show(message: string, type: Toast['type'] = 'success', duration?: number) {
    const id = `toast-${++this.idCounter}-${Date.now()}`;
    const toast: Toast = { id, message, type, duration };
    this.toasts.push(toast);
    this.notify();
    return id;
  }

  remove(id: string) {
    this.toasts = this.toasts.filter((toast) => toast.id !== id);
    this.notify();
  }

  getToasts() {
    return [...this.toasts];
  }
}

export const toastManager = new ToastManager();

export const toast = {
  success: (message: string, duration?: number) => toastManager.show(message, 'success', duration),
  error: (message: string, duration?: number) => toastManager.show(message, 'error', duration),
  info: (message: string, duration?: number) => toastManager.show(message, 'info', duration),
};


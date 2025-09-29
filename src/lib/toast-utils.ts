// Utilitaire de toast global pour éviter les problèmes de contexte
interface ToastMessage {
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
}

class ToastManager {
  private listeners: ((toast: ToastMessage) => void)[] = [];

  subscribe(listener: (toast: ToastMessage) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify(toast: ToastMessage) {
    this.listeners.forEach(listener => listener(toast));
  }

  success(title: string, message: string) {
    this.notify({ type: 'success', title, message });
  }

  error(title: string, message: string) {
    this.notify({ type: 'error', title, message });
  }

  info(title: string, message: string) {
    this.notify({ type: 'info', title, message });
  }

  warning(title: string, message: string) {
    this.notify({ type: 'warning', title, message });
  }
}

export const toastManager = new ToastManager();

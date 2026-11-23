import { Injectable, signal } from '@angular/core';

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title?: string;
  message: string;
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  toasts = signal<ToastMessage[]>([]);

  show(message: string, type: 'success' | 'info' | 'warning' | 'error' = 'success', title?: string, duration: number = 3000): void {
    // Prevent duplicate spam: If the exact same message is already showing, ignore
    if (this.toasts().some(t => t.message === message)) {
      return;
    }

    const id = Math.random().toString(36).substring(2, 9);
    const toast: ToastMessage = { id, type, title, message, duration };

    // Keep at most 2 recent toasts on screen to prevent screen flooding
    this.toasts.update(current => {
      const trimmed = current.length >= 2 ? current.slice(-1) : current;
      return [...trimmed, toast];
    });

    setTimeout(() => {
      this.remove(id);
    }, duration);
  }

  remove(id: string): void {
    this.toasts.update(current => current.filter(t => t.id !== id));
  }
}


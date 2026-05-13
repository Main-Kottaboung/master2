import { Injectable, signal } from '@angular/core';

export type ToastKind = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: number;
  kind: ToastKind;
  title: string;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private readonly toastsSignal = signal<ToastMessage[]>([]);
  private readonly timeoutIds = new Map<number, ReturnType<typeof setTimeout>>();
  private nextId = 1;

  readonly toasts = this.toastsSignal.asReadonly();

  success(title: string, message?: string): void {
    this.push('success', title, message);
  }

  error(title: string, message?: string): void {
    this.push('error', title, message);
  }

  info(title: string, message?: string): void {
    this.push('info', title, message);
  }

  dismiss(id: number): void {
    const timeoutId = this.timeoutIds.get(id);
    if (timeoutId) {
      clearTimeout(timeoutId);
      this.timeoutIds.delete(id);
    }

    this.toastsSignal.update((toasts) => toasts.filter((toast) => toast.id !== id));
  }

  clear(): void {
    for (const timeoutId of this.timeoutIds.values()) {
      clearTimeout(timeoutId);
    }

    this.timeoutIds.clear();
    this.toastsSignal.set([]);
  }

  private push(kind: ToastKind, title: string, message?: string): void {
    const id = this.nextId++;
    const toast: ToastMessage = { id, kind, title, message };

    this.toastsSignal.update((toasts) => [...toasts, toast]);

    const timeoutId = setTimeout(() => this.dismiss(id), 3500);
    this.timeoutIds.set(id, timeoutId);
  }
}

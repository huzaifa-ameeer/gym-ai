"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { AlertIcon, CheckIcon, InfoIcon, XIcon } from "@/components/icons";

type ToastVariant = "success" | "error" | "info";

export type ToastInput = {
  title: string;
  description?: string;
  variant?: ToastVariant;
};

type ToastRecord = ToastInput & {
  id: number;
  leaving: boolean;
};

type ToastFn = (toast: ToastInput) => void;

const ToastContext = createContext<ToastFn | null>(null);

export function useToast() {
  const push = useContext(ToastContext);
  if (!push) {
    throw new Error("useToast must be used inside ToastProvider.");
  }
  return push;
}

const iconForVariant = {
  success: { Icon: CheckIcon, className: "bg-accent-soft text-accent-ink" },
  error: {
    Icon: AlertIcon,
    className: "bg-red-500/10 text-red-600 dark:text-red-400",
  },
  info: { Icon: InfoIcon, className: "bg-accent-soft text-accent-ink" },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastRecord[]>([]);
  const nextId = useRef(0);
  const timers = useRef(new Map<number, number>());

  const remove = useCallback((id: number) => {
    timers.current.delete(id);
    setToasts((list) => list.filter((toast) => toast.id !== id));
  }, []);

  const dismiss = useCallback(
    (id: number) => {
      setToasts((list) =>
        list.map((toast) =>
          toast.id === id ? { ...toast, leaving: true } : toast,
        ),
      );

      const existing = timers.current.get(id);
      if (existing) window.clearTimeout(existing);
      timers.current.set(
        id,
        window.setTimeout(() => remove(id), 180),
      );
    },
    [remove],
  );

  const push = useCallback<ToastFn>(
    (input) => {
      const id = nextId.current++;
      const toast: ToastRecord = {
        variant: "info",
        ...input,
        id,
        leaving: false,
      };

      setToasts((list) => [...list.slice(-2), toast]);
      timers.current.set(
        id,
        window.setTimeout(() => dismiss(id), 3000),
      );
    },
    [dismiss],
  );

  useEffect(() => {
    const pending = timers.current;
    return () => {
      pending.forEach((timer) => window.clearTimeout(timer));
    };
  }, []);

  return (
    <ToastContext.Provider value={push}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-4 bottom-4 z-[100] flex flex-col gap-2 sm:inset-x-auto sm:bottom-auto sm:right-6 sm:top-20 sm:w-[380px]"
      >
        {toasts.map((toast) => {
          const { Icon, className } =
            iconForVariant[toast.variant ?? "info"];

          return (
            <div
              key={toast.id}
              role={toast.variant === "error" ? "alert" : "status"}
              className={`toast-enter pointer-events-auto flex items-start gap-3 rounded-2xl border border-line bg-surface p-4 shadow-2xl shadow-black/10 transition-all duration-200 ${
                toast.leaving
                  ? "translate-y-2 opacity-0"
                  : "translate-y-0 opacity-100"
              }`}
            >
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${className}`}
              >
                <Icon className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground">
                  {toast.title}
                </p>
                {toast.description ? (
                  <p className="mt-1 text-sm leading-5 text-muted">
                    {toast.description}
                  </p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => dismiss(toast.id)}
                aria-label="Dismiss notification"
                className="-mr-1 -mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-muted transition-colors duration-200 hover:bg-accent-soft hover:text-foreground"
              >
                <XIcon className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

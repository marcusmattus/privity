"use client";
import { CheckCircle2, X } from "lucide-react";

export function ToastAlert({
  message,
  onDismiss,
}: {
  message: string;
  onDismiss: () => void;
}) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 border border-settled/40 bg-slate px-4 py-3 shadow-2xl text-xs text-paper figure animate-in fade-in slide-in-from-bottom-3">
      <CheckCircle2 className="w-4 h-4 text-settled flex-shrink-0" />
      <span>{message}</span>
      <button
        onClick={onDismiss}
        className="ml-2 text-paper/40 hover:text-paper"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

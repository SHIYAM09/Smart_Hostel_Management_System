import { CheckCircle, AlertCircle, XCircle, Info, X } from "lucide-react";
import { cls } from "../../utils/classNames";
import { useHostel } from "../../context/HostelContext";
import { useEffect, useState } from "react";

const ICONS = { success: CheckCircle, error: XCircle, warning: AlertCircle, info: Info };
const STYLES = {
  success: "bg-emerald-50 border-emerald-200 text-emerald-800",
  error: "bg-red-50 border-red-200 text-red-800",
  warning: "bg-amber-50 border-amber-200 text-amber-800",
  info: "bg-blue-50 border-blue-200 text-blue-800",
};

function ToastItem({ toast, onDismiss }) {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const duration = toast.duration || 4000;
    const interval = 50;
    const step = 100 / (duration / interval);
    
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          onDismiss();
          return 0;
        }
        return prev - step;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [toast, onDismiss]);

  const Icon = ICONS[toast.type] ?? Info;

  return (
    <div
      className={cls(
        "relative flex items-start gap-3 px-4 py-3 rounded-xl border shadow-lg text-sm font-semibold animate-modal",
        "transition-all duration-300 hover:shadow-xl",
        STYLES[toast.type]
      )}
      role="alert"
      aria-live={toast.type === "error" ? "assertive" : "polite"}
    >
      <Icon size={18} className="shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="font-medium">{toast.message}</p>
        {toast.description && (
          <p className="text-xs mt-1 opacity-80">{toast.description}</p>
        )}
      </div>
      <button
        onClick={() => onDismiss()}
        className="shrink-0 p-1 rounded hover:bg-black/5 transition-colors"
        aria-label="Dismiss notification"
      >
        <X size={14} />
      </button>
      <div
        className="absolute bottom-0 left-0 h-0.5 bg-current opacity-30 transition-all duration-50"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

export function ToastContainer() {
  const { toasts, removeToast } = useHostel();
  if (!toasts.length) return null;

  return (
    <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 max-w-sm">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={() => removeToast(t.id)} />
      ))}
    </div>
  );
}

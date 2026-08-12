// Enhanced modal dialog with smooth animations and backdrop.
import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cls } from "../../utils/classNames";

export function Modal({ open, onClose, title, children, wide, closeOnBackdrop = true }) {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (open) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  const handleBackdropClick = (e) => {
    if (closeOnBackdrop && e.target === e.currentTarget) onClose();
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-50 p-4 flex items-center justify-center"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className={cls(
          "relative bg-[#0c2340] rounded-2xl shadow-2xl w-full max-h-[90vh] overflow-y-auto border border-blue-100",
          "animate-modal transition-all duration-300",
          wide ? "max-w-2xl" : "max-w-lg"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 sticky top-0 bg-[#0c2340] z-10">
          <h3 id="modal-title" className="text-lg font-bold text-white">{title}</h3>
          <button 
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>
        <div className="px-6 py-5 bg-[#0c2340] text-white">{children}</div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

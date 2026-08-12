import { AlertTriangle } from "lucide-react";
import { Modal } from "./Modal";
import { Button } from "./Button";

export function ConfirmDialog({ open, onClose, onConfirm, title = "Confirm Delete", message = "Are you sure? This action cannot be undone.", confirmLabel = "Delete", loading = false }) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <div className="space-y-5">
        <div className="flex items-start gap-4 p-4 bg-amber-500/20 border border-amber-500/30 rounded-xl">
          <AlertTriangle size={20} className="text-amber-400 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-200">{message}</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={onClose} className="flex-1" disabled={loading}>Cancel</Button>
          <Button onClick={onConfirm} className="flex-1 bg-red-600 hover:bg-red-700" disabled={loading}>{loading ? "Deleting..." : confirmLabel}</Button>
        </div>
      </div>
    </Modal>
  );
}

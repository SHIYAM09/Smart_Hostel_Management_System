// Labeled wrapper for form inputs.
import { cls } from "../../utils/classNames";

export function FormField({ label, children, darkMode = false }) {
  return (
    <div className="space-y-2">
      <label className={cls("text-sm font-bold", darkMode ? "text-white" : "text-gray-700")}>
        {label}
      </label>
      {children}
    </div>
  );
}

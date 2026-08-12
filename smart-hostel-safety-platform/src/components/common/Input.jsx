// Enhanced text input with floating label and validation support.
import { cls } from "../../utils/classNames";
import { useState } from "react";

export function Input({ label, error, required, className, darkMode = false, ...p }) {
  const [focused, setFocused] = useState(false);
  const [hasValue, setHasValue] = useState(false);

  const handleChange = (e) => {
    setHasValue(e.target.value.length > 0);
    p.onChange?.(e);
  };

  const bgColor = darkMode ? "bg-white/10" : "bg-white";
  const textColor = darkMode ? "text-white placeholder-white/50" : "text-gray-900 placeholder-gray-400";
  const labelColor = darkMode ? "text-white/70" : "text-gray-400";
  const labelFocusedColor = darkMode ? "text-white" : "text-blue-600";
  const labelBg = darkMode ? "bg-[#0c2340]" : "bg-white";
  const borderColor = darkMode ? "border-white/20 focus:border-white/40" : "border-gray-200 focus:border-blue-500";
  const ringColor = darkMode ? "focus:ring-white/20" : "focus:ring-blue-500";

  return (
    <div className="relative">
      {label && (
        <label className={cls(
          "absolute left-4 top-3 text-sm transition-all duration-200 pointer-events-none",
          focused || hasValue ? "-top-2.5 left-3 text-xs px-1" : "",
          error ? "text-red-400" : focused ? labelFocusedColor : labelColor,
          (focused || hasValue) && labelBg
        )}>
          {label} {required && <span className="text-red-400">*</span>}
        </label>
      )}
      <input
        {...p}
        onChange={handleChange}
        onFocus={(e) => { setFocused(true); p.onFocus?.(e); }}
        onBlur={(e) => { setFocused(false); p.onBlur?.(e); }}
        className={cls(
          "w-full px-4 py-3 rounded-xl border transition-all duration-200",
          bgColor,
          textColor,
          "focus:outline-none focus:ring-2 focus:border-transparent",
          error
            ? "border-red-400 focus:ring-red-400/20"
            : borderColor,
          ringColor,
          className
        )}
        aria-invalid={error ? "true" : "false"}
        aria-describedby={error ? `${p.id}-error` : undefined}
      />
      {error && (
        <p id={`${p.id}-error`} className="mt-1 text-xs text-red-400 font-medium">
          {error}
        </p>
      )}
    </div>
  );
}

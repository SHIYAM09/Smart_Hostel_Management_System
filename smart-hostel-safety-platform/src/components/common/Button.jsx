// Primary/secondary/danger button variants with enhanced states.
import { cls } from "../../utils/classNames";
import { Loader2 } from "lucide-react";

export function Button({ children, variant = "primary", className = "", loading = false, disabled = false, icon: Icon, ...p }) {
  const baseStyles = "flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-base font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-sm hover:shadow-md focus:ring-blue-500",
    secondary: "border border-gray-200 bg-white hover:bg-gray-50 active:bg-gray-100 text-gray-700 shadow-sm hover:shadow-md focus:ring-gray-500",
    danger: "bg-red-50 hover:bg-red-100 active:bg-red-200 border border-red-200 text-red-600 shadow-sm hover:shadow-md focus:ring-red-500",
    ghost: "bg-transparent hover:bg-gray-100 active:bg-gray-200 text-gray-700 focus:ring-gray-500",
  };

  const handleClick = (e) => {
    if (loading || disabled) {
      e.preventDefault();
      return;
    }
    p.onClick?.(e);
  };

  return (
    <button
      {...p}
      onClick={handleClick}
      disabled={disabled || loading}
      className={cls(baseStyles, variants[variant], className)}
    >
      {loading ? (
        <Loader2 size={18} className="animate-spin" />
      ) : Icon ? (
        <Icon size={18} />
      ) : null}
      {loading ? "Loading..." : children}
    </button>
  );
}

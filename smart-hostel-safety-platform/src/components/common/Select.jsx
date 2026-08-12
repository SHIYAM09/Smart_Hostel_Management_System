// Styled select dropdown.
import { cls } from "../../utils/classNames";

export function Select({ children, options, darkMode = false, className = "", ...p }) {
  const bgColor = darkMode ? "bg-[#162a45] text-white" : "bg-[#f4f8fc] text-gray-900";
  const borderColor = darkMode ? "border-white/20 focus:border-white/40" : "border-gray-200 focus:border-blue-500";
  const ringColor = darkMode ? "focus:ring-white/20" : "focus:ring-blue-500";

  return (
    <select
      {...p}
      className={cls(
        "w-full px-4 py-3 rounded-xl border transition-all appearance-none cursor-pointer text-base font-medium",
        bgColor,
        borderColor,
        ringColor,
        "focus:outline-none focus:ring-2 focus:border-transparent",
        className
      )}
    >
      {children ? children : (options || []).map((opt) => {
        const val = typeof opt === "object" ? opt.value : opt;
        const lbl = typeof opt === "object" ? opt.label : opt;
        return (
          <option key={val} value={val} className="bg-[#0c1e35] text-white py-2">
            {lbl}
          </option>
        );
      })}
    </select>
  );
}

// Circular avatar with auto-generated initials and color.
import { cls } from "../../utils/classNames";

export function Avatar({ name, size="md" }) {
  const initials = name.split(" ").map(n=>n[0]).join("").slice(0,2).toUpperCase();
  const palette  = ["bg-blue-500","bg-indigo-500","bg-violet-500","bg-cyan-500","bg-teal-500","bg-sky-500","bg-rose-500"];
  const c = palette[name.charCodeAt(0)%palette.length];
  const s = size==="sm"?"w-8 h-8 text-sm":size==="lg"?"w-16 h-16 text-xl":"w-10 h-10 text-base";
  return <div className={cls("rounded-full flex items-center justify-center font-bold text-white shrink-0",c,s)}>{initials}</div>;
}

// Status pill used across admin, warden, and student views.
import { cls } from "../../utils/classNames";

export function Badge({ status }) {
  const m = {
    active:"bg-emerald-50 text-emerald-700 border-emerald-200", inactive:"bg-gray-100 text-gray-600 border-gray-200",
    available:"bg-emerald-50 text-emerald-700 border-emerald-200", occupied:"bg-blue-50 text-blue-700 border-blue-200",
    maintenance:"bg-amber-50 text-amber-700 border-amber-200", present:"bg-emerald-50 text-emerald-700 border-emerald-200",
    absent:"bg-red-50 text-red-700 border-red-200", late:"bg-amber-50 text-amber-700 border-amber-200",
    open:"bg-red-50 text-red-700 border-red-200", "in-progress":"bg-amber-50 text-amber-700 border-amber-200",
    resolved:"bg-emerald-50 text-emerald-700 border-emerald-200", "checked-in":"bg-blue-50 text-blue-700 border-blue-200",
    "checked-out":"bg-gray-100 text-gray-600 border-gray-200", "in-campus":"bg-cyan-50 text-cyan-700 border-cyan-200",
    pending:"bg-violet-50 text-violet-700 border-violet-200", approved:"bg-emerald-50 text-emerald-700 border-emerald-200",
    rejected:"bg-red-50 text-red-700 border-red-200", low:"bg-emerald-50 text-emerald-700 border-emerald-200",
    medium:"bg-amber-50 text-amber-700 border-amber-200", high:"bg-red-50 text-red-700 border-red-200",
    critical:"bg-red-100 text-red-800 border-red-300", admin:"bg-violet-50 text-violet-700 border-violet-200",
    warden:"bg-blue-50 text-blue-700 border-blue-200", student:"bg-cyan-50 text-cyan-700 border-cyan-200",
  };
  return <span className={cls("inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border capitalize", m[status]??"bg-gray-100 text-gray-600 border-gray-200")}>{status.replace(/-/g," ")}</span>;
}

// Skeleton loading component for various UI elements.
import { cls } from "../../utils/classNames";

const baseClass = "animate-pulse bg-gray-200 rounded";

export function Skeleton({ className, variant = "default", ...props }) {
  const variants = {
    default: "h-4 w-full",
    text: "h-4 w-3/4",
    title: "h-6 w-1/2",
    avatar: "h-10 w-10 rounded-full",
    button: "h-10 w-24",
    card: "h-32 w-full",
    circle: "h-12 w-12 rounded-full",
  };

  return (
    <div
      className={cls(baseClass, variants[variant], className)}
      {...props}
      role="status"
      aria-label="Loading"
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-blue-50 shadow-sm p-4 space-y-3">
      <div className="flex items-center gap-3">
        <Skeleton variant="avatar" />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" className="w-1/2" />
          <Skeleton variant="text" className="w-3/4" />
        </div>
      </div>
      <Skeleton variant="card" className="h-16" />
    </div>
  );
}

export function SkeletonTable({ rows = 5, columns = 4 }) {
  return (
    <div className="bg-white rounded-2xl border border-blue-50 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-gray-100">
        <Skeleton className="h-10 w-64" />
      </div>
      <div className="divide-y divide-gray-100">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex gap-4 p-4">
            {Array.from({ length: columns }).map((_, j) => (
              <Skeleton key={j} className="flex-1 h-4" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonStats({ count = 4 }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl border border-blue-50 shadow-sm p-4 space-y-3">
          <Skeleton variant="circle" className="h-9 w-9" />
          <Skeleton variant="title" />
          <Skeleton variant="text" />
        </div>
      ))}
    </div>
  );
}

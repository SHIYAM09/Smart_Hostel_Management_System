// Enhanced card component with hover effects and elevation.
import { cls } from "../../utils/classNames";
import { forwardRef } from "react";

export const Card = forwardRef(({ children, className, hover = true, clickable = false, onClick, ...props }, ref) => {
  return (
    <div
      ref={ref}
      onClick={onClick}
      className={cls(
        "bg-white rounded-2xl border border-blue-50 shadow-sm transition-all duration-300",
        hover && "hover:shadow-md hover:border-blue-200 hover:-translate-y-0.5",
        clickable && "cursor-pointer active:scale-[0.98]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

Card.displayName = "Card";

export function CardHeader({ children, className }) {
  return <div className={cls("px-5 py-4 border-b border-gray-100", className)}>{children}</div>;
}

export function CardBody({ children, className }) {
  return <div className={cls("px-5 py-4", className)}>{children}</div>;
}

export function CardFooter({ children, className }) {
  return <div className={cls("px-5 py-4 border-t border-gray-100 bg-gray-50/50 rounded-b-2xl", className)}>{children}</div>;
}

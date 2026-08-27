import { useEffect } from "react";
import {
  AlertCircle,
  Bell,
  CheckCircle,
  XCircle,
  Trash2,
  CheckCheck,
} from "lucide-react";
import { useHostel } from "../../context/HostelContext";
import { cls } from "../../utils/classNames";

export default function SharedNotifications({ role }) {
  const { notifications, markAsRead, markAllAsRead, deleteNotification, clearNotifications, refreshNotifications } = useHostel();

  useEffect(() => {
    refreshNotifications();
  }, [refreshNotifications]);
  
  const items = notifications.filter(n => n.forRole === "all" || n.forRole === role);
  const unreadCount = items.filter(n => !n.read).length;

  const iconMap = { info: Bell, warning: AlertCircle, success: CheckCircle, error: XCircle };
  const colorMap = {
    info: "bg-blue-50 text-blue-600 border-blue-200",
    warning: "bg-amber-50 text-amber-600 border-amber-200",
    success: "bg-emerald-50 text-emerald-600 border-emerald-200",
    error: "bg-red-50 text-red-600 border-red-200",
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <span className="text-base text-gray-600 font-semibold">{unreadCount} unread notifications</span>
        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <button
              onClick={() => markAllAsRead && markAllAsRead()}
              className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 transition-colors"
            >
              <CheckCheck size={14} /> Mark all read
            </button>
          )}
          {items.length > 0 && (
            <button
              onClick={() => clearNotifications && clearNotifications()}
              className="text-xs text-red-600 hover:text-red-700 font-semibold flex items-center gap-1 bg-red-50 px-3 py-1.5 rounded-lg border border-red-100 transition-colors"
            >
              <Trash2 size={14} /> Clear all
            </button>
          )}
        </div>
      </div>

      {items.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center mb-3">
            <Bell size={28} />
          </div>
          <h3 className="text-lg font-bold text-gray-800">No Notifications</h3>
          <p className="text-sm text-gray-500 max-w-sm mt-1">
            You're all caught up! System updates, leave statuses, and complaint alerts will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((n) => {
            const Icon = iconMap[n.type] || Bell;
            return (
              <div
                key={n.id}
                onClick={() => markAsRead && markAsRead(n.id)}
                className={cls(
                  "bg-white rounded-2xl border p-5 flex items-start gap-4 cursor-pointer hover:shadow-md transition-all relative group",
                  n.read ? "border-gray-100 opacity-80" : "border-blue-100 shadow-sm bg-blue-50/10"
                )}
              >
                <div className={cls("w-12 h-12 rounded-xl flex items-center justify-center border shrink-0", colorMap[n.type] || colorMap.info)}>
                  <Icon size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between gap-2">
                    <div className="font-bold text-base text-gray-900">{n.title}</div>
                    <span className="text-xs text-gray-400 shrink-0">{n.time}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{n.message}</p>
                </div>

                <div className="flex items-center gap-2">
                  {!n.read && <div className="w-2.5 h-2.5 bg-blue-500 rounded-full shrink-0 mt-1" />}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification && deleteNotification(n.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 p-1 transition-opacity"
                    title="Delete Notification"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

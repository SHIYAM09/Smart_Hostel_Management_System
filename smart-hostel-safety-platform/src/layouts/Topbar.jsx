// Top header bar with page title, subtitle, and notification bell.
import {
  Bell,
  Menu,
} from "lucide-react";

export function Topbar({ title,subtitle,onMenu,onBell,unread,alertCount }) {
  return (
    <header className="h-16 bg-white border-b border-blue-100 flex items-center px-5 gap-4 sticky top-0 z-20 shadow-sm">
      <button onClick={onMenu} className="p-2.5 rounded-xl hover:bg-blue-50 text-gray-500 hover:text-blue-600 lg:hidden transition-colors"><Menu size={21}/></button>
      <div><div className="text-base font-bold text-gray-900">{title}</div><div className="text-xs text-gray-400">{subtitle}</div></div>
      <div className="ml-auto flex items-center gap-2">
        {alertCount!=null&&alertCount>0&&(
          <div className="hidden sm:flex items-center gap-2 mr-3 bg-red-50 border border-red-200 rounded-xl px-4 py-2">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"/>
            <span className="text-sm font-semibold text-red-700">{alertCount} Active Alerts</span>
          </div>
        )}
        <button onClick={onBell} className="relative p-3 rounded-xl hover:bg-blue-50 text-gray-500 hover:text-blue-600 transition-colors">
          <Bell size={19}/>
          {unread>0&&<span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">{unread}</span>}
        </button>
      </div>
    </header>
  );
}


import { useEffect } from "react";
import {
  Bell,
  CalendarCheck,
  CalendarDays,
  CheckCircle,
  MessageSquareWarning,
  Utensils,
  XCircle,
} from "lucide-react";
import { useHostel } from "../../context/HostelContext";
import { cls } from "../../utils/classNames";
import { Badge } from "../../components/common/Badge";
import { Card, CardHeader, CardBody } from "../../components/common/Card";
import { AnimatedCounter } from "../../components/common/AnimatedCounter";

import { useAuth } from "../../hooks/useAuth";

export default function StudentHome({ onNav }) {
  const { complaints, leaveRequests, attendance, messData, dashboardMetrics, weeklyMessMenu, refreshDashboard } = useHostel();

  useEffect(() => {
    refreshDashboard();
  }, [refreshDashboard]);

  const { userName } = useAuth();
  const pct = attendance.length ? Math.round((attendance.filter(r => r.status === "present").length / attendance.length) * 100) : (dashboardMetrics?.attendancePercentage || 0);
  const myC = complaints;
  const myLeave = leaveRequests.filter(l => l.status === "pending").length || dashboardMetrics?.pendingLeaveRequests || 0;

  return (
    <div className="space-y-5">
      <div className="bg-gradient-to-r from-[#0c2340] to-[#1a56db] rounded-2xl p-6 text-white relative overflow-hidden shadow-lg">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
        <div className="relative">
          <div className="text-white/70 text-sm mb-1">Welcome back,</div>
          <h2 className="text-2xl font-extrabold">{userName || "Student User"}</h2>
          <div className="text-blue-200 text-sm mt-0.5">Hostel Resident · Smart Hostel Safety Platform</div>
          <div className="flex gap-4 mt-5">
            {[{ value: pct, label: "Attendance" }, { value: myC.filter(c => c.status !== "resolved").length, label: "Open Complaints" }, { value: myLeave, label: "Pending Leave" }].map(s => (
              <div key={s.label} className="bg-white/15 backdrop-blur-sm rounded-xl px-4 py-3 text-center transition-all hover:bg-white/20 hover:scale-105"><div className="text-xl font-bold">{typeof s.value === 'number' ? <AnimatedCounter value={s.value} suffix={s.label === "Attendance" ? "%" : ""} /> : s.value}</div><div className="text-xs text-blue-200">{s.label}</div></div>
            ))}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {[{ label: "View Attendance", icon: CalendarCheck, screen: "my-attendance", c: "bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100" }, { label: "Request Leave", icon: CalendarDays, screen: "leave-requests", c: "bg-violet-50 text-violet-700 hover:bg-violet-100 border-violet-100" }, { label: "File Complaint", icon: MessageSquareWarning, screen: "my-complaint", c: "bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-100" }, { label: "Mess Menu", icon: Utensils, screen: "mess-menu", c: "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-100" }].map(({ label, icon: Icon, screen, c }) => (
          <button key={label} onClick={() => onNav(screen)} className={cls("flex flex-col items-center gap-3 p-6 rounded-2xl border transition-all text-base font-bold hover:shadow-md hover:-translate-y-0.5 active:scale-95", c)}><Icon size={24} className="transition-transform hover:scale-110" />{label}</button>
        ))}
      </div>
      <Card>
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100"><h3 className="font-bold text-gray-900 text-base">Recent Attendance</h3><button onClick={() => onNav("my-attendance")} className="text-sm text-blue-600 font-semibold hover:text-blue-700 transition-colors">View all</button></div>
        <div className="divide-y divide-gray-50">{attendance.length ? attendance.slice(0, 4).map(r => (
          <div key={r.date} className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-gray-50">
            <div className={cls("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform hover:scale-110", r.status === "present" ? "bg-emerald-50" : r.status === "late" ? "bg-amber-50" : "bg-red-50")}>
              {r.status === "present" ? <CheckCircle size={16} className="text-emerald-600" /> : r.status === "late" ? <Bell size={16} className="text-amber-600" /> : <XCircle size={16} className="text-red-600" />}
            </div>
            <div className="flex-1"><div className="text-base font-semibold text-gray-800">{r.date}</div><div className="text-sm text-gray-400">{r.time || "Logged"}</div></div>
            <Badge status={r.status} />
          </div>
        )) : <div className="p-6 text-center text-sm text-gray-400">No attendance records logged yet.</div>}</div>
      </Card>
      <Card>
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100"><h3 className="font-bold text-gray-900 text-base">Today's Mess Menu</h3><button onClick={() => onNav("mess-menu")} className="text-sm text-blue-600 font-semibold hover:text-blue-700 transition-colors">Full menu</button></div>
        <div className="p-5 grid grid-cols-3 gap-4">{["breakfast", "lunch", "dinner"].map(meal => {
          const currentDayName = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][new Date().getDay()];
          const todayMenu = weeklyMessMenu?.find(
            (m) => m.dayOfWeek?.toLowerCase() === currentDayName.toLowerCase() || m.day?.toLowerCase() === currentDayName.slice(0, 3).toLowerCase()
          );
          return (
            <div key={meal} className="bg-gray-50 rounded-xl p-4 transition-all hover:bg-gray-100 hover:shadow-md">
              <div className="text-xs font-bold text-gray-500 uppercase mb-2 capitalize">{meal}</div>
              <div className="text-sm text-gray-700 leading-snug">
                {todayMenu ? (todayMenu[meal] || "Not configured") : "No menu configured"}
              </div>
            </div>
          );
        })}</div>
      </Card>
    </div>
  );
}

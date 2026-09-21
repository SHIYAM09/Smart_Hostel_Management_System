
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
import { getSanitizedUsername } from "../../utils/userUtils";

export default function StudentHome({ onNav }) {
  const {
    complaints,
    leaveRequests,
    attendance,
    messData,
    dashboardMetrics,
    weeklyMessMenu,
    refreshDashboard,
    refreshAttendance,
    refreshComplaints,
    refreshLeaveRequests,
    refreshMessMenu,
  } = useHostel();

  useEffect(() => {
    refreshDashboard();
    refreshAttendance();
    refreshComplaints();
    refreshLeaveRequests();
    refreshMessMenu();
  }, [refreshDashboard, refreshAttendance, refreshComplaints, refreshLeaveRequests, refreshMessMenu]);

  const { userName } = useAuth();
  const activeUser = (() => { try { return JSON.parse(localStorage.getItem("user")) || {}; } catch { return {}; } })();
  const displayUsername = getSanitizedUsername(activeUser.username || activeUser.fullName ? activeUser : userName);

  const pct = attendance && attendance.length > 0
    ? Math.round((attendance.filter((r) => String(r.status).toLowerCase() === "present").length / attendance.length) * 100)
    : 0;

  const openComplaintsCount = complaints.length
    ? complaints.filter((c) => String(c.status).toLowerCase() !== "resolved").length
    : (dashboardMetrics?.pendingComplaints ?? 0);

  const pendingLeaveCount = leaveRequests.length
    ? leaveRequests.filter((l) => String(l.status).toLowerCase() === "pending").length
    : (dashboardMetrics?.pendingLeaveRequests ?? 0);

  return (
    <div className="space-y-5">
      <div className="bg-gradient-to-r from-[#0c2340] to-[#1a56db] rounded-2xl p-6 text-white relative overflow-hidden shadow-lg">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
        <div className="relative">
          <div className="text-white/70 text-sm mb-1">Welcome back,</div>
          <h2 className="text-2xl font-extrabold">{displayUsername}</h2>
          <div className="text-blue-200 text-sm mt-0.5">Hostel Resident</div>
          <div className="flex gap-4 mt-5">
            {[
              { value: pct, label: "Attendance", screen: "my-attendance" },
              { value: openComplaintsCount, label: "Open Complaints", screen: "my-complaint" },
              { value: pendingLeaveCount, label: "Pending Leave", screen: "leave-requests" }
            ].map(s => (
              <div
                key={s.label}
                onClick={() => onNav(s.screen)}
                className="bg-white/15 backdrop-blur-sm rounded-xl px-4 py-3 text-center transition-all hover:bg-white/20 hover:scale-105 cursor-pointer"
              >
                <div className="text-xl font-bold">
                  {typeof s.value === 'number' ? <AnimatedCounter value={s.value} suffix={s.label === "Attendance" ? "%" : ""} /> : s.value}
                </div>
                <div className="text-xs text-blue-200">{s.label}</div>
              </div>
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
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h3 className="font-bold text-gray-900 text-base">Recent Attendance</h3>
          <button onClick={() => onNav("my-attendance")} className="text-sm text-blue-600 font-semibold hover:text-blue-700 transition-colors">View all</button>
        </div>
        <div className="divide-y divide-gray-50">
          {(!attendance || attendance.length === 0) ? (
            <div className="p-6 text-center text-sm font-semibold text-gray-500">
              No attendance records yet.
            </div>
          ) : (
            attendance.slice(0, 4).map((r) => {
              const st = String(r.status).toLowerCase();
              return (
                <div key={r.date} className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-gray-50">
                  <div className={cls("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform hover:scale-110", st === "present" ? "bg-emerald-50" : st === "late" ? "bg-amber-50" : "bg-red-50")}>
                    {st === "present" ? <CheckCircle size={16} className="text-emerald-600" /> : st === "late" ? <Bell size={16} className="text-amber-600" /> : <XCircle size={16} className="text-red-600" />}
                  </div>
                  <div className="flex-1">
                    <div className="text-base font-semibold text-gray-800">{r.date}</div>
                    <div className="text-sm text-gray-400">{r.time || "Logged"}</div>
                  </div>
                  <Badge status={r.status} />
                </div>
              );
            })
          )}
        </div>
      </Card>
      <Card>
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h3 className="font-bold text-gray-900 text-base">Today's Mess Menu</h3>
          <button onClick={() => onNav("mess-menu")} className="text-sm text-blue-600 font-semibold hover:text-blue-700 transition-colors">Full menu</button>
        </div>
        <div className="p-5 grid grid-cols-3 gap-4">
          {(() => {
            const DEFAULT_WEEKLY_MENU = [
              { id: 1, dayOfWeek: "Monday", day: "Monday", breakfast: "Idli, Vada, Sambhar, Chutney", lunch: "South Indian Thali, Rice, Sambar, Rasam, Curd", snacks: "Samosa, Tea/Coffee", dinner: "Chapati, Paneer Butter Masala, Veg Biryani, Sweet" },
              { id: 2, dayOfWeek: "Tuesday", day: "Tuesday", breakfast: "Puri Bhaji, Masala Tea", lunch: "North Indian Thali, Roti, Dal Tadka, Jeera Rice", snacks: "Mirchi Bajji, Tea/Coffee", dinner: "Roti, Kadhai Paneer / Chicken Curry, Rice, Ice Cream" },
              { id: 3, dayOfWeek: "Wednesday", day: "Wednesday", breakfast: "Dosa, Coconut Chutney, Sambhar", lunch: "Veg Fried Rice, Manchurian, Curd Rice", snacks: "Biscuits, Tea/Coffee", dinner: "Roti, Mix Veg Curry, Puliyogare, Fruit Salad" },
              { id: 4, dayOfWeek: "Thursday", day: "Thursday", breakfast: "Uttapam, Tomato Chutney", lunch: "Lemon Rice, Potato Fry, Sambar, Curd", snacks: "Pani Puri, Tea/Coffee", dinner: "Naan, Dal Makhani, Veg Pulao, Gulab Jamun" },
              { id: 5, dayOfWeek: "Friday", day: "Friday", breakfast: "Upma, Kesari, Chutney", lunch: "Bisibelebath, Potato Chips, Curd", snacks: "Pakora, Masala Tea", dinner: "Roti, Paneer Tikka Masala / Egg Curry, Ghee Rice" },
              { id: 6, dayOfWeek: "Saturday", day: "Saturday", breakfast: "Pongal, Vada, Sambhar", lunch: "Curd Rice, Tomato Rice, Papad", snacks: "Bread Omelette / Veg Sandwich, Tea", dinner: "Special Hyderabadi Biryani (Veg/Non-Veg), Raita, Kheer" },
              { id: 7, dayOfWeek: "Sunday", day: "Sunday", breakfast: "Aloo Paratha, Curd, Pickle", lunch: "Special Sunday Feast, Veg/Chicken Pulao, Sweet", snacks: "Pastry, Coffee", dinner: "Roti, Malai Kofta, Jeera Rice, Fruit Custard" }
            ];
            const currentDayName = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][new Date().getDay()];
            const todayMenu = (weeklyMessMenu && weeklyMessMenu.length > 0 ? weeklyMessMenu : DEFAULT_WEEKLY_MENU).find(
              (m) => m.dayOfWeek?.toLowerCase() === currentDayName.toLowerCase() || m.day?.toLowerCase() === currentDayName.slice(0, 3).toLowerCase()
            ) || DEFAULT_WEEKLY_MENU.find((m) => m.dayOfWeek.toLowerCase() === currentDayName.toLowerCase());

            return ["breakfast", "lunch", "dinner"].map((meal) => (
              <div key={meal} className="bg-gray-50 rounded-xl p-4 transition-all hover:bg-gray-100 hover:shadow-md">
                <div className="text-xs font-bold text-gray-500 uppercase mb-2 capitalize">{meal}</div>
                <div className="text-sm text-gray-700 leading-snug font-medium">
                  {todayMenu ? (todayMenu[meal] || "Delicious meal prepared") : "Delicious meal prepared"}
                </div>
              </div>
            ));
          })()}
        </div>
      </Card>
    </div>
  );
}
